import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-900 text-slate-200 lg:flex">
        <Link to="/admin" className="flex items-center gap-2 px-5 py-5">
          <img
            src="/logo.png"
            alt={`${settings.businessName} logo`}
            className="h-9 w-9 rounded-xl object-cover ring-1 ring-white/20"
          />
          <div>
            <div className="font-display text-base font-bold text-white">
              {settings.businessName}
            </div>
            <div className="-mt-0.5 text-xs text-brand-200">Admin console</div>
          </div>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          <AdminLink to="/admin" label="Overview" icon="📊" end />
          <AdminLink to="/admin/designs" label="Designs" icon="🧵" />
          <AdminLink to="/admin/orders" label="Orders" icon="📦" />
          <AdminLink to="/admin/messages" label="Messages" icon="✉️" />
          <AdminLink to="/admin/clients" label="Clients" icon="👥" />
          <AdminLink to="/admin/settings" label="Settings" icon="⚙️" />
          <AdminLink to="/admin/activity" label="Activity log" icon="📜" />
        </nav>
        <div className="border-t border-slate-800 p-4 text-xs text-slate-400">
          <div className="mb-2">
            Signed in as<br />
            <span className="font-medium text-slate-200">{user?.name}</span>
            <span className="ml-2 rounded-full bg-brand-700 px-2 py-0.5 text-[10px] uppercase text-white">
              admin
            </span>
          </div>
          <Link to="/" className="btn-ghost mb-2 w-full justify-center !bg-slate-800 !text-slate-200 !ring-slate-700 hover:!bg-slate-700">
            View site
          </Link>
          <button
            className="btn-danger w-full justify-center"
            onClick={() => { logout(); navigate('/'); }}
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex w-full min-w-0 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <Link to="/admin" className="font-display font-bold text-slate-900">Admin</Link>
          <div className="flex gap-2">
            <Link to="/admin/orders" className="btn-ghost">Orders</Link>
            <Link to="/admin/messages" className="btn-ghost">Messages</Link>
            <Link to="/admin/designs" className="btn-ghost">Designs</Link>
            <button className="btn-danger" onClick={() => { logout(); navigate('/'); }}>Logout</button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AdminLink({ to, label, icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? 'bg-brand-600 text-white shadow-soft'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}
