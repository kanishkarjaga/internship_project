import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company: '',
    address: '',
  });
  const [busy, setBusy] = useState(false);

  function update(k) {
    return (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await register(form);
      toast.success('Welcome!');
      navigate('/client', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col justify-center px-4 py-12">
      <div className="card p-8">
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Create a client account</h1>
        <p className="mt-1 text-sm text-slate-500">Sign up to browse the gallery and message us.</p>
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Full name</label>
            <input required className="input" value={form.name} onChange={update('name')} />
          </div>
          <div>
            <label className="label">Email</label>
            <input required type="email" className="input" value={form.email} onChange={update('email')} />
          </div>
          <div>
            <label className="label">Password (8+ chars)</label>
            <input
              required
              minLength={8}
              type="password"
              className="input"
              value={form.password}
              onChange={update('password')}
            />
          </div>
          <div>
            <label className="label">Phone (optional)</label>
            <input className="input" value={form.phone} onChange={update('phone')} />
          </div>
          <div>
            <label className="label">Company (optional)</label>
            <input className="input" value={form.company} onChange={update('company')} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address (optional)</label>
            <input className="input" value={form.address} onChange={update('address')} />
          </div>
          <div className="sm:col-span-2 mt-2">
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? 'Creating…' : 'Create account'}
            </button>
          </div>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-medium text-brand-700 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
