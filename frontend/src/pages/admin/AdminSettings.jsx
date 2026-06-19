import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api.js';

export default function AdminSettings() {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then((d) => setS(d.settings)).catch(() => {});
  }, []);

  function update(k, v) {
    setS((prev) => ({ ...prev, [k]: v }));
  }
  function updateSocial(k, v) {
    setS((prev) => ({ ...prev, socials: { ...prev.socials, [k]: v } }));
  }
  function updateNotif(k, v) {
    setS((prev) => ({ ...prev, notifications: { ...prev.notifications, [k]: v } }));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await api.put('/admin/settings', s);
      setS(data.settings);
      toast.success('Settings saved.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!s) return <div className="text-slate-500">Loading…</div>;

  return (
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-2">
      <section className="card space-y-3 p-6">
        <h2 className="font-display text-lg font-bold text-slate-900">Business info</h2>
        <div>
          <label className="label">Business name</label>
          <input className="input" value={s.businessName || ''} onChange={(e) => update('businessName', e.target.value)} />
        </div>
        <div>
          <label className="label">Tagline</label>
          <input className="input" value={s.tagline || ''} onChange={(e) => update('tagline', e.target.value)} />
        </div>
        <div>
          <label className="label">About</label>
          <textarea className="input min-h-[120px]" value={s.aboutText || ''} onChange={(e) => update('aboutText', e.target.value)} />
        </div>
      </section>

      <section className="card space-y-3 p-6">
        <h2 className="font-display text-lg font-bold text-slate-900">Contact</h2>
        <div>
          <label className="label">Email</label>
          <input className="input" value={s.contactEmail || ''} onChange={(e) => update('contactEmail', e.target.value)} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={s.contactPhone || ''} onChange={(e) => update('contactPhone', e.target.value)} />
        </div>
        <div>
          <label className="label">Address</label>
          <input className="input" value={s.address || ''} onChange={(e) => update('address', e.target.value)} />
        </div>
        <div>
          <label className="label">Hero image URL</label>
          <input className="input" value={s.heroImage || ''} onChange={(e) => update('heroImage', e.target.value)} />
        </div>
      </section>

      <section className="card space-y-3 p-6">
        <h2 className="font-display text-lg font-bold text-slate-900">Socials</h2>
        <div>
          <label className="label">Facebook</label>
          <input className="input" value={s.socials?.facebook || ''} onChange={(e) => updateSocial('facebook', e.target.value)} />
        </div>
        <div>
          <label className="label">Instagram</label>
          <input className="input" value={s.socials?.instagram || ''} onChange={(e) => updateSocial('instagram', e.target.value)} />
        </div>
        <div>
          <label className="label">Twitter / X</label>
          <input className="input" value={s.socials?.twitter || ''} onChange={(e) => updateSocial('twitter', e.target.value)} />
        </div>
      </section>

      <section className="card space-y-3 p-6">
        <h2 className="font-display text-lg font-bold text-slate-900">Notifications</h2>
        <p className="text-sm text-slate-500">Internal flags for what to log. Email/push integration can be added later.</p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!s.notifications?.notifyOnContact}
            onChange={(e) => updateNotif('notifyOnContact', e.target.checked)}
          />
          Notify admin on contact-form submissions
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!s.notifications?.notifyOnClientMessage}
            onChange={(e) => updateNotif('notifyOnClientMessage', e.target.checked)}
          />
          Notify admin on client dashboard messages
        </label>
      </section>

      <div className="lg:col-span-2 flex justify-end">
        <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button>
      </div>
    </form>
  );
}
