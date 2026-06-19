import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import CartLink from './CartLink.jsx';

export default function ClientLayout() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <Link to="/" className="flex items-center gap-2 px-5 py-5">
          <img
            src="/logo.png"
            alt={`${settings.businessName} logo`}
            className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-200"
          />
          <div>
            <div className="font-display text-base font-bold text-slate-900">
              {settings.businessName}
            </div>
            <div className="-mt-0.5 text-xs text-brand-700">Client portal</div>
          </div>
        </Link>
        <nav className="flex-1 space-y-1 px-3">
          <SideLink to="/client" label="Dashboard" icon="📊" end />
          <SideLink to="/client/gallery" label="Browse designs" icon="🧵" />
          <SideLink to="/client/orders" label="My orders" icon="📦" />
          <SideLink to="/client/messages" label="My messages" icon="✉️" />
          <SideLink to="/client/profile" label="My profile" icon="👤" />
        </nav>
        <div className="border-t border-slate-100 p-4 text-xs text-slate-500">
          <div className="mb-2">
            Signed in as<br />
            <span className="font-medium text-slate-700">{user?.name}</span>
          </div>
          <button
            className="btn-ghost w-full justify-center"
            onClick={() => { logout(); navigate('/'); }}
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex w-full min-w-0 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <Link to="/client" className="font-display font-bold text-slate-900">
            {settings.businessName}
          </Link>
          <div className="flex items-center gap-2">
            <CartLink className="btn-ghost" />
            <Link to="/client/messages" className="btn-ghost">Messages</Link>
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

function SideLink({ to, label, icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`
      }
    >
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}
