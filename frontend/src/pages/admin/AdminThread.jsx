import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../utils/api.js';

export default function AdminThread() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  function load() {
    api.get(`/messages/${id}`).then((d) => {
      setThread(d.message);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }));
    });
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function send(e) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/messages/${id}/reply`, { body: reply });
      setReply('');
      load();
    } catch (err) { toast.error(err.message); } finally { setSending(false); }
  }

  async function close() {
    try {
      await api.post(`/messages/${id}/close`);
      toast.success('Closed.');
      load();
    } catch (err) { toast.error(err.message); }
  }

  if (!thread) return <div className="text-slate-500">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/messages" className="text-sm text-brand-700 hover:underline">← All messages</Link>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-slate-900">{thread.subject}</h1>
          <div className="text-xs text-slate-500">
            From {thread.client?.name || thread.contactName} ({thread.client?.email || thread.contactEmail})
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge">{thread.status}</span>
          {thread.status !== 'closed' && (
            <button onClick={close} className="btn-ghost">Close thread</button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="card max-h-[60vh] overflow-y-auto p-6">
        <Bubble who={thread.client?.name || thread.contactName || 'Client'} from="Client" tone="client" body={thread.body} time={thread.createdAt} />
        {thread.replies?.map((r, i) => (
          <Bubble key={i} who={r.author?.name || (r.from === 'admin' ? 'Admin' : 'Client')} from={r.from === 'admin' ? 'Admin' : 'Client'} tone={r.from === 'admin' ? 'admin' : 'client'} body={r.body} time={r.createdAt} />
        ))}
      </div>

      <form onSubmit={send} className="card flex items-end gap-2 p-3">
        <textarea
          className="input min-h-[64px] flex-1"
          placeholder="Reply to the client…"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <button className="btn-primary" disabled={sending}>{sending ? 'Sending…' : 'Send'}</button>
      </form>
    </div>
  );
}

function Bubble({ who, from, body, time, tone }) {
  const toneCls =
    tone === 'admin'
      ? 'bg-brand-50 text-slate-900 ring-brand-100'
      : 'bg-white text-slate-900 ring-slate-200';
  return (
    <div className={`mb-3 max-w-2xl rounded-2xl px-4 py-3 ring-1 ${toneCls}`}>
      <div className="mb-0.5 flex items-center gap-2 text-xs text-slate-500">
        <span className="font-semibold text-slate-700">{who}</span>
        <span>· {from}</span>
        <span>· {new Date(time).toLocaleString()}</span>
      </div>
      <div className="whitespace-pre-wrap text-sm">{body}</div>
    </div>
  );
}
