import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, fileUrl } from '../../utils/api.js';
import { StatusPill } from './ClientOrders.jsx';

export default function ClientOrderDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const justPaid = params.get('paid') === '1';
  const wasCancelled = params.get('cancelled') === '1';
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.get(`/orders/mine/${id}`)
      .then((d) => setOrder(d.order))
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function cancel() {
    if (!confirm('Cancel this order?')) return;
    try {
      await api.post(`/orders/${id}/cancel`);
      toast.success('Order cancelled.');
      load();
    } catch (err) { toast.error(err.message); }
  }

  async function downloadItem(item) {
    try {
      const a = document.createElement('a');
      a.href = `/api/me/designs/${item.design}/download`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) { toast.error('Could not start download.'); }
  }

  if (loading) return <div className="text-slate-500">Loading…</div>;
  if (!order) return <div className="text-slate-500">Order not found.</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/client/orders" className="text-sm text-brand-700 hover:underline">
            ← All orders
          </Link>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-slate-900">
            Order #{String(order._id).slice(-8)}
          </h1>
          <div className="mt-0.5 text-xs text-slate-500">
            Placed {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={order.status} />
          {['pending', 'paid'].includes(order.status) && (
            <button onClick={cancel} className="btn-ghost">Cancel</button>
          )}
        </div>
      </div>

      {justPaid && (
        <div className="card flex items-center gap-3 border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-xl">
            🎉
          </div>
          <div>
            <div className="font-display text-base font-bold">Payment received</div>
            <div className="text-sm">Your order is now in the queue. We'll email when it ships.</div>
          </div>
        </div>
      )}
      {wasCancelled && (
        <div className="card flex items-center gap-3 border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-xl">
            ℹ️
          </div>
          <div className="text-sm">Payment was cancelled. Your order is still pending — you can pay again anytime.</div>
        </div>
      )}

      <section className="card overflow-hidden">
        <div className="bg-gradient-to-r from-brand-500 to-indigo-500 px-5 py-3 text-white">
          <h2 className="font-display text-base font-bold">Items</h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {order.items.map((it) => (
            <li key={it.design} className="flex items-center gap-4 px-5 py-4">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                {it.fileUrl ? (
                  <img src={fileUrl(it.fileUrl)} alt={it.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xl text-slate-400">🧵</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/client/design/${it.design}`}
                  className="line-clamp-1 font-display text-sm font-bold text-slate-900 hover:text-brand-700"
                >
                  {it.title}
                </Link>
                <div className="text-xs text-slate-500">
                  ${Number(it.price).toFixed(2)} × {it.quantity}
                </div>
              </div>
              <div className="text-right font-display text-sm font-bold text-slate-900">
                ${(it.price * it.quantity).toFixed(2)}
              </div>
              {order.status === 'paid' || order.status === 'fulfilled' ? (
                <button onClick={() => downloadItem(it)} className="btn-ghost ml-2">
                  Download
                </button>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="space-y-1 border-t border-slate-100 p-5 text-sm">
          <Row label="Subtotal" value={order.subtotal} />
          <Row label="Shipping" value={order.shippingFee} />
          <Row label="Tax" value={order.tax} />
          <div className="mt-2 flex items-baseline justify-between border-t border-slate-100 pt-3">
            <span className="font-display text-base font-bold text-slate-900">Total</span>
            <span className="font-display text-2xl font-extrabold text-brand-700">
              ${order.total.toFixed(2)} {order.currency}
            </span>
          </div>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-5 py-3 text-white">
          <h2 className="font-display text-base font-bold">Shipping & payment</h2>
        </div>
        <div className="grid gap-6 p-5 text-sm sm:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">Ship to</div>
            <div className="mt-1 font-medium text-slate-900">{order.shipping?.name || '—'}</div>
            <div className="text-slate-600">{order.shipping?.company}</div>
            <div className="text-slate-600">{order.shipping?.address}</div>
            <div className="text-slate-600">{order.shipping?.phone}</div>
            {order.shipping?.notes && (
              <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs italic text-slate-600">
                “{order.shipping.notes}”
              </div>
            )}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">Payment</div>
            <div className="mt-1 font-medium text-slate-900">
              {order.payment.provider === 'stripe' ? 'Stripe' : 'Test / mock payment'}
            </div>
            <div className="text-xs text-slate-500">
              {order.payment.paidAt
                ? `Paid ${new Date(order.payment.paidAt).toLocaleString()}`
                : 'Awaiting payment'}
            </div>
            {order.payment.sessionId && (
              <div className="mt-1 break-all font-mono text-[11px] text-slate-400">
                {order.payment.sessionId}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-slate-600">
      <span>{label}</span>
      <span>${Number(value || 0).toFixed(2)}</span>
    </div>
  );
}
