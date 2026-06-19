import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api.js';

const STATUSES = ['all', 'pending', 'paid', 'fulfilled', 'cancelled', 'refunded'];

export default function ClientOrders() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/orders/mine')
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = status === 'all' ? items : items.filter((o) => o.status === status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">My orders</h1>
        <p className="text-slate-500">{items.length} order{items.length === 1 ? '' : 's'} total.</p>
      </div>

      <div className="card flex flex-wrap gap-1 p-3">
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

      <div className="card divide-y divide-slate-100">
        {loading ? (
          <div className="p-6 text-slate-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-3xl">
              📦
            </div>
            <div className="font-display text-sm font-bold text-slate-900">No orders here</div>
            <p className="mt-1 text-sm text-slate-500">
              When you place an order, it will appear here with its status.
            </p>
            <Link to="/client/gallery" className="btn-primary mt-4 inline-flex">
              Browse designs →
            </Link>
          </div>
        ) : (
          filtered.map((o) => (
            <Link
              key={o._id}
              to={`/client/orders/${o._id}`}
              className="flex items-center justify-between px-5 py-4 transition hover:bg-gradient-to-r hover:from-brand-50 hover:to-transparent"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 text-xl">
                  📦
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-slate-900">
                      Order #{String(o._id).slice(-8)}
                    </span>
                    <StatusPill status={o.status} />
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {o.items.length} item{o.items.length === 1 ? '' : 's'} ·{' '}
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-base font-extrabold text-brand-700">
                  ${o.total.toFixed(2)}
                </div>
                <div className="text-[11px] uppercase text-slate-400">{o.currency}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export function StatusPill({ status }) {
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
