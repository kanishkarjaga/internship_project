import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ClientProfile() {
  const { user, updateProfile, changePassword } = useAuth();
  const [profile, setProfile] = useState({
    name: user.name || '',
    phone: user.phone || '',
    company: user.company || '',
    address: user.address || '',
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profile);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setChanging(true);
    try {
      await changePassword(pw);
      toast.success('Password changed.');
      setPw({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setChanging(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={saveProfile} className="card space-y-4 p-6">
        <h2 className="font-display text-lg font-bold text-slate-900">Profile</h2>
        <div>
          <label className="label">Name</label>
          <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
        </div>
        <div>
          <label className="label">Company</label>
          <input className="input" value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} />
        </div>
        <div>
          <label className="label">Address</label>
          <input className="input" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
        </div>
        <div className="flex justify-end">
          <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
        </div>
      </form>

      <form onSubmit={savePassword} className="card space-y-4 p-6">
        <h2 className="font-display text-lg font-bold text-slate-900">Change password</h2>
        <div>
          <label className="label">Current password</label>
          <input type="password" className="input" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
        </div>
        <div>
          <label className="label">New password (8+ chars)</label>
          <input type="password" minLength={8} className="input" required value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
        </div>
        <div className="flex justify-end">
          <button className="btn-primary" disabled={changing}>{changing ? 'Saving…' : 'Change password'}</button>
        </div>
      </form>
    </div>
  );
}
