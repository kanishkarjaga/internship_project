import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../utils/api.js';
import { StatusBadge } from './ClientDashboard.jsx';

export default function ClientMessages() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ subject: '', body: '' });
  const [sending, setSending] = useState(false);

  function load() {
    setLoading(true);
    api.get('/messages/mine')
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  async function send(e) {
    e.preventDefault();
    if (!form.subject.trim() || !form.body.trim()) return;
    setSending(true);
    try {
      await api.post('/messages/mine', form);
      toast.success('Message sent to admin.');
      setForm({ subject: '', body: '' });
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">My messages</h1>
        <p className="text-slate-500">Send us a question, request, or feedback.</p>
      </div>

      <form onSubmit={send} className="card space-y-3 p-6">
        <input
          required
          className="input"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
        />
        <textarea
          required
          className="input min-h-[120px]"
          placeholder="Tell us what you need…"
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
        />
        <div className="flex justify-end">
          <button className="btn-primary" disabled={sending}>
            {sending ? 'Sending…' : 'Send to admin'}
          </button>
        </div>
      </form>

      <div className="card divide-y divide-slate-100">
        <div className="flex items-center justify-between p-5">
          <h2 className="font-display text-lg font-bold text-slate-900">History</h2>
          <span className="text-xs text-slate-400">{items.length} threads</span>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No messages yet.</div>
        ) : (
          items.map((m) => (
            <Link
              key={m._id}
              to={`/client/messages/${m._id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">{m.subject}</div>
                <div className="truncate text-xs text-slate-500">{m.body}</div>
                <div className="mt-0.5 text-[11px] text-slate-400">
                  Updated {new Date(m.updatedAt).toLocaleString()}
                </div>
              </div>
              <StatusBadge status={m.status} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
