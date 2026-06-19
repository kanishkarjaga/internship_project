import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api.js';

const STATUSES = ['all', 'open', 'replied', 'closed'];

export default function AdminMessages() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (q) params.set('q', q);
    api.get(`/messages?${params.toString()}`)
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status, q]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Messages</h1>
        <p className="text-slate-500">Threads from clients and the public contact form.</p>
      </div>

      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <input
          type="search"
          className="input flex-1"
          placeholder="Search subject, body, name, email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="flex gap-1">
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

      <div className="card divide-y divide-slate-100">
        {loading ? (
          <div className="p-6 text-slate-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-slate-500">No messages here.</div>
        ) : (
          items.map((m) => (
            <Link
              key={m._id}
              to={`/admin/messages/${m._id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-slate-900">{m.subject}</span>
                  {m.source === 'contact' && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase text-amber-700">
                      contact form
                    </span>
                  )}
                </div>
                <div className="truncate text-xs text-slate-500">
                  From: {m.client?.name || m.contactName} · {m.client?.email || m.contactEmail}
                </div>
                <div className="mt-0.5 truncate text-xs text-slate-400">{m.body}</div>
              </div>
              <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                m.status === 'open'
                  ? 'bg-amber-100 text-amber-700'
                  : m.status === 'replied'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {m.status}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
