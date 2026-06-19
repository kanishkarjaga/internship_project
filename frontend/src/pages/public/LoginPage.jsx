import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '';
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  function update(k) {
    return (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form);
      const target = next || (user.role === 'admin' ? '/admin' : '/client');
      navigate(target, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="card p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <img src="/logo.png" alt="Logo" className="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200 shadow-soft" />
          <h1 className="font-display text-2xl font-extrabold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500">Sign in to your account.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" required className="input" value={form.email} onChange={update('email')} />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required className="input" value={form.password} onChange={update('password')} />
          </div>
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          No account? <Link to="/register" className="font-medium text-brand-700 hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
