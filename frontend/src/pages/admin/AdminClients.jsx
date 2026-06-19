import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api.js';

export default function AdminClients() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    api.get(`/admin/clients?${params.toString()}`)
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q]);

  async function toggle(u) {
    try {
      await api.put(`/admin/clients/${u._id}/active`, { isActive: !u.isActive });
      toast.success(u.isActive ? 'Disabled.' : 'Activated.');
      load();
    } catch (err) { toast.error(err.message); }
  }

  async function remove(u) {
    if (!confirm(`Delete client "${u.name}"? This is irreversible.`)) return;
    try {
      await api.del(`/admin/clients/${u._id}`);
      toast.success('Deleted.');
      load();
    } catch (err) { toast.error(err.message); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Clients</h1>
        <p className="text-slate-500">{items.length} registered.</p>
      </div>

      <div className="card p-4">
        <input
          type="search"
          className="input"
          placeholder="Search by name, email, or company…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 text-slate-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-slate-500">No clients yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600">{u.company || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {u.isActive ? 'active' : 'disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="btn-ghost" onClick={() => toggle(u)}>
                        {u.isActive ? 'Disable' : 'Activate'}
                      </button>
                      <button className="btn-danger" onClick={() => remove(u)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
