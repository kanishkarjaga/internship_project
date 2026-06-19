import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import CartLink from './CartLink.jsx';

export default function PublicLayout() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt={`${settings.businessName} logo`}
              className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200"
            />
            <div>
              <div className="font-display text-lg font-bold text-slate-900">
                {settings.businessName}
              </div>
              <div className="-mt-0.5 text-xs text-slate-500">{settings.tagline}</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <NavItem to="/" label="Home" />
            <NavItem to="/gallery" label="Designs" />
            <NavItem to="/contact" label="Contact" />
          </nav>
          <div className="flex items-center gap-2">
            <CartLink className="btn-ghost" />
            {user ? (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin' : '/client'}
                  className="btn-ghost"
                >
                  {user.role === 'admin' ? 'Admin' : 'Dashboard'}
                </Link>
                <button className="btn-primary" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Login</Link>
                <Link to="/register" className="btn-primary">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 text-sm text-slate-500 sm:grid-cols-3">
          <div>
            <div className="font-display font-bold text-slate-900">{settings.businessName}</div>
            <div className="mt-1">{settings.tagline}</div>
          </div>
          <div>
            <div className="font-medium text-slate-700">Contact</div>
            <div>{settings.contactEmail}</div>
            <div>{settings.contactPhone}</div>
          </div>
          <div>
            <div className="font-medium text-slate-700">Explore</div>
            <div className="mt-1 flex flex-col gap-1">
              <Link to="/gallery" className="hover:text-brand-700">Design gallery</Link>
              <Link to="/contact" className="hover:text-brand-700">Send a message</Link>
              <Link to="/login" className="hover:text-brand-700">Client login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-brand-700'
        }`
      }
    >
      {label}
    </NavLink>
  );
}
