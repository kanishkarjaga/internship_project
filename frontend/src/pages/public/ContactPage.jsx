import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api.js';
import { useSettings } from '../../context/SettingsContext.jsx';

export default function ContactPage() {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: '', email: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);

  function update(k) {
    return (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/messages/contact', form);
      toast.success('Message sent! We will reply soon.');
      setForm({ name: '', email: '', subject: '', body: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900">Contact us</h1>
        <p className="mt-2 max-w-xl text-slate-600">
          Send us a message and we will get back to you within one business day.
        </p>
        <form onSubmit={submit} className="card mt-8 space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Your name</label>
              <input className="input" required value={form.name} onChange={update('name')} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" required value={form.email} onChange={update('email')} />
            </div>
          </div>
          <div>
            <label className="label">Subject</label>
            <input className="input" required value={form.subject} onChange={update('subject')} />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea
              className="input min-h-[140px]"
              required
              value={form.body}
              onChange={update('body')}
            />
          </div>
          <button className="btn-primary" disabled={sending}>
            {sending ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </div>
      <aside className="space-y-6">
        <div className="card p-6">
          <h3 className="font-display text-lg font-bold text-slate-900">Direct contact</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>📞 {settings.contactPhone}</li>
            <li>✉️ {settings.contactEmail}</li>
            {settings.address && <li>📍 {settings.address}</li>}
          </ul>
        </div>
        <div className="card p-6">
          <h3 className="font-display text-lg font-bold text-slate-900">Already a client?</h3>
          <p className="mt-2 text-sm text-slate-600">
            Log in to message us from your dashboard and track replies.
          </p>
          <a href="/login" className="btn-primary mt-4">Go to login</a>
        </div>
      </aside>
    </div>
  );
}
