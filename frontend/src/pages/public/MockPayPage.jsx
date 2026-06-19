import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../utils/api.js';

export default function MockPayPage() {
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const token = params.get('token');
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    api.get(`/orders/mine/${orderId}`).then((d) => setOrder(d.order)).catch(() => {});
  }, [orderId]);

  async function pay() {
    setBusy(true);
    try {
      await api.post(`/orders/${orderId}/mock-pay`, { token });
      toast.success('Payment successful!');
      navigate(`/client/orders/${orderId}?paid=1`, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  function cancel() {
    navigate(`/client/orders/${orderId}?cancelled=1`, { replace: true });
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="card overflow-hidden p-0">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-800 to-indigo-700 p-6 text-white">
          <DecorPattern />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-200/80">
              Mock checkout (no Stripe configured)
            </p>
            <h1 className="mt-2 font-display text-2xl font-extrabold">Pay for your order</h1>
            <p className="mt-1 text-sm text-brand-100/90">
              In production this is a secure Stripe-hosted page. Here we simulate it locally.
            </p>
          </div>
        </div>

        <div className="space-y-4 p-6">
          {order ? (
            <>
              <div className="rounded-xl bg-slate-50 p-4 text-sm">
                <div className="text-xs uppercase tracking-wide text-slate-400">Order</div>
                <div className="font-mono text-slate-700">#{String(order._id).slice(-8)}</div>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Shipping</span>
                <span>${order.shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-slate-100 pt-3">
                <span className="font-display text-base font-bold text-slate-900">Total</span>
                <span className="font-display text-2xl font-extrabold text-brand-700">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            <div className="text-sm text-slate-500">Loading order…</div>
          )}

          <button onClick={pay} className="btn-primary w-full" disabled={busy || !order}>
            {busy ? 'Processing…' : `Pay $${order ? order.total.toFixed(2) : '…'}`}
          </button>
          <button onClick={cancel} className="btn-ghost w-full">
            Cancel and go back
          </button>
          <p className="text-center text-[11px] text-slate-400">
            Test mode · No card will be charged
          </p>
        </div>
      </div>
    </div>
  );
}

function DecorPattern() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full opacity-20"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id="mockpay-decor" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M6 0 L0 0 L0 6" fill="none" stroke="white" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mockpay-decor)" />
    </svg>
  );
}
