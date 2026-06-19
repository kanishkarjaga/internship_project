import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api.js';

const STATUSES = ['all', 'pending', 'paid', 'fulfilled', 'cancelled', 'refunded'];

export default function AdminOrders() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (q) params.set('q', q);
    api.get(`/admin/orders?${params.toString()}`)
      .then((d) => { setItems(d.items || []); setTotal(d.total || 0); })
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  async function fulfill(id) {
    try {
      await api.post(`/admin/orders/${id}/fulfill`);
      toast.success('Order fulfilled.');
      load();
    } catch (err) { toast.error(err.message); }
  }

  async function refund(id) {
    if (!confirm('Mark this order as refunded?')) return;
    try {
      await api.post(`/admin/orders/${id}/refund`);
      toast.success('Order refunded.');
      load();
    } catch (err) { toast.error(err.message); }
  }

  const gross = items
    .filter((o) => ['paid', 'fulfilled'].includes(o.status))
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Orders</h1>
        <p className="text-slate-500">{total} total · {items.length} on this page</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <BigStat icon="📦" label="On this page" value={items.length} accent="from-brand-500 to-indigo-500" />
        <BigStat icon="💰" label="Gross (paid + fulfilled)" value={`$${gross.toFixed(2)}`} accent="from-emerald-500 to-teal-500" />
        <BigStat icon="⏳" label="Awaiting fulfilment" value={items.filter((o) => o.status === 'paid').length} accent="from-amber-500 to-rose-500" />
      </div>

      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <input
          className="input flex-1"
          placeholder="Search by client name, email, item title, or notes…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <button onClick={load} className="btn-ghost">Search</button>
        <div className="flex flex-wrap gap-1 sm:ml-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ring-1 transition ${
                status === s
                  ? 'bg-brand-600 text-white ring-brand-600'
                  : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No orders match the filter.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Placed</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((o) => (
                <OrderRow
                  key={o._id}
                  order={o}
                  expanded={openId === o._id}
                  onToggle={() => setOpenId(openId === o._id ? null : o._id)}
                  onFulfill={() => fulfill(o._id)}
                  onRefund={() => refund(o._id)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function OrderRow({ order, expanded, onToggle, onFulfill, onRefund }) {
  return (
    <>
      <tr className="cursor-pointer hover:bg-slate-50" onClick={onToggle}>
        <td className="px-4 py-3 font-mono text-xs text-slate-700">#{String(order._id).slice(-8)}</td>
        <td className="px-4 py-3">
          <div className="font-semibold text-slate-900">{order.client?.name || '—'}</div>
          <div className="text-xs text-slate-500">{order.client?.email}</div>
        </td>
        <td className="px-4 py-3 text-slate-600">
          {order.items.length} item{order.items.length === 1 ? '' : 's'}
        </td>
        <td className="px-4 py-3 font-display font-bold text-slate-900">${order.total.toFixed(2)}</td>
        <td className="px-4 py-3"><StatusPill status={order.status} /></td>
        <td className="px-4 py-3 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</td>
        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
          {order.status === 'paid' && (
            <button onClick={onFulfill} className="btn-primary !py-1.5 !text-xs">Fulfil</button>
          )}
          {(order.status === 'paid' || order.status === 'fulfilled') && (
            <button onClick={onRefund} className="btn-ghost ml-2 !py-1.5 !text-xs">Refund</button>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50">
          <td colSpan="7" className="px-4 py-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="card overflow-hidden">
                <div className="bg-gradient-to-r from-brand-500 to-indigo-500 px-4 py-2 text-white">
                  <div className="font-display text-sm font-bold">Items</div>
                </div>
                <ul className="divide-y divide-slate-100 text-sm">
                  {order.items.map((it) => (
                    <li key={it.design} className="flex items-center justify-between px-4 py-2">
                      <div>
                        <div className="font-semibold text-slate-900">{it.title}</div>
                        <div className="text-xs text-slate-500">
                          ${Number(it.price).toFixed(2)} × {it.quantity}
                        </div>
                      </div>
                      <div className="font-bold">${(it.price * it.quantity).toFixed(2)}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card overflow-hidden">
                <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-4 py-2 text-white">
                  <div className="font-display text-sm font-bold">Ship to</div>
                </div>
                <div className="p-4 text-sm">
                  <div className="font-semibold text-slate-900">{order.shipping?.name || '—'}</div>
                  <div className="text-slate-600">{order.shipping?.company}</div>
                  <div className="text-slate-600">{order.shipping?.address}</div>
                  <div className="text-slate-600">{order.shipping?.phone}</div>
                  {order.shipping?.notes && (
                    <div className="mt-2 rounded-lg bg-white px-3 py-2 text-xs italic text-slate-600 ring-1 ring-slate-200">
                      “{order.shipping.notes}”
                    </div>
                  )}
                  <div className="mt-3 text-xs text-slate-500">
                    Payment: {order.payment.provider} ·{' '}
                    {order.payment.paidAt
                      ? `paid ${new Date(order.payment.paidAt).toLocaleString()}`
                      : 'awaiting payment'}
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function StatusPill({ status }) {
  const map = {
    pending: 'bg-amber-100 text-amber-700 ring-amber-200',
    paid: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    fulfilled: 'bg-brand-100 text-brand-700 ring-brand-200',
    cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
    refunded: 'bg-rose-100 text-rose-700 ring-rose-200',
  };
  const icons = { pending: '⏳', paid: '✓', fulfilled: '✓', cancelled: '✕', refunded: '↺' };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ${
        map[status] || 'bg-slate-100 text-slate-600 ring-slate-200'
      }`}
    >
      <span>{icons[status] || '•'}</span>
      {status}
    </span>
  );
}

function BigStat({ icon, label, value, accent }) {
  return (
    <div className="card relative overflow-hidden p-5">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent} opacity-80`} />
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-2xl text-white shadow-soft`}>
          {icon}
        </div>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
          <div className="font-display text-xl font-extrabold text-slate-900">{value}</div>
        </div>
      </div>
    </div>
  );
}
