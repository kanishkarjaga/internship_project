import { useEffect, useState } from 'react';
import { api } from '../../utils/api.js';

export default function AdminActivity() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [action, setAction] = useState('');
  const limit = 50;

  function load(p = page) {
    const params = new URLSearchParams();
    if (action) params.set('action', action);
    params.set('page', p);
    api.get(`/admin/activity?${params.toString()}`).then((d) => {
      setItems(d.items || []);
      setTotal(d.total || 0);
    });
  }
  useEffect(() => { load(1); /* eslint-disable-next-line */ }, [action]);

  const pages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Activity log</h1>
        <p className="text-slate-500">{total} events recorded.</p>
      </div>

      <div className="card flex flex-col gap-3 p-4 sm:flex-row">
        <input
          className="input flex-1"
          placeholder="Filter by action (e.g. message.send)"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((l) => (
              <tr key={l._id}>
                <td className="px-4 py-3 text-slate-500">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {l.actor?.name || l.actorRole}
                  {l.actor?.role && (
                    <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase text-slate-600">{l.actor.role}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-700">{l.action}</td>
                <td className="px-4 py-3 text-slate-500">
                  {l.targetType && `${l.targetType} ${l.targetId}`}
                </td>
                <td className="px-4 py-3 text-slate-500">{l.ip || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          <button className="btn-ghost" disabled={page <= 1} onClick={() => { const p = page - 1; setPage(p); load(p); }}>← Prev</button>
          <div className="self-center text-sm text-slate-500">Page {page} of {pages}</div>
          <button className="btn-ghost" disabled={page >= pages} onClick={() => { const p = page + 1; setPage(p); load(p); }}>Next →</button>
        </div>
      )}
    </div>
  );
}
