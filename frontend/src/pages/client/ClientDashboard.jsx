import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ClientDashboard() {
  const [recent, setRecent] = useState([]);
  const [msgs, setMsgs] = useState([]);

  useEffect(() => {
    api.get('/public/designs?limit=4').then((d) => setRecent(d.items || [])).catch(() => {});
    api.get('/messages/mine').then((d) => setMsgs(d.items || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-600 p-6 text-white shadow-soft sm:p-8">
        <DecorPattern />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-100/80">
              Welcome back
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
              Hi {user.name.split(' ')[0]} <span className="inline-block animate-wiggle">👋</span>
            </h1>
            <p className="mt-1 max-w-lg text-sm text-brand-100/90 sm:text-base">
              Browse the gallery, message us with custom requests, and download your embroidery files.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Link
              to="/client/gallery"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 shadow-soft transition hover:bg-brand-50"
            >
              🧵 Browse designs
            </Link>
            <Link
              to="/client/messages"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/20"
            >
              ✉️ New message
            </Link>
          </div>
        </div>
      </section>

      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          to="/client/gallery"
          tone="brand"
          icon="🧵"
          label="Library"
          value="Open"
          hint="Tap to browse all designs"
        />
        <StatCard
          to="/client/orders"
          tone="emerald"
          icon="📦"
          label="Your orders"
          value={msgs.length /* placeholder count */ > 0 ? 'Active' : '0 yet'}
          hint="Track status & download files"
        />
        <StatCard
          to="/client/profile"
          tone={user.isActive ? 'sky' : 'rose'}
          icon={user.isActive ? '✅' : '⛔'}
          label="Account"
          value={user.isActive ? 'Active' : 'Disabled'}
          hint={user.isActive ? 'You can browse & download' : 'Contact admin to re-enable'}
        />
      </div>

      {/* New designs */}
      <section className="card overflow-hidden">
        <CardHeader
          icon="🧵"
          title="New designs"
          subtitle="Fresh uploads from our library"
          accent="from-brand-500 to-indigo-500"
          action={{ to: '/client/gallery', label: 'View gallery →' }}
        />
        {recent.length === 0 ? (
          <EmptyState
            icon="🧵"
            title="No designs yet"
            body="Check back soon — we add new patterns every week."
          />
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((d) => (
              <Link
                key={d._id}
                to={`/client/design/${d._id}`}
                className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                  {d.fileMime?.startsWith('image/') ? (
                    <img
                      src={d.fileUrl}
                      alt={d.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">🧵</div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute bottom-2 left-2 inline-flex items-center rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold capitalize text-brand-700 shadow">
                    {d.category}
                  </span>
                  <span className="absolute bottom-2 right-2 inline-flex items-center rounded-full bg-brand-700/95 px-2 py-0.5 text-[11px] font-semibold text-white shadow">
                    ${Number(d.price).toFixed(2)}
                  </span>
                </div>
                <div className="p-3">
                  <div className="line-clamp-1 font-display text-sm font-bold text-slate-900">
                    {d.title}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    New · just added
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent messages */}
      <section className="card overflow-hidden">
        <CardHeader
          icon="✉️"
          title="Recent messages"
          subtitle="Your conversations with our team"
          accent="from-emerald-500 to-teal-500"
          action={{ to: '/client/messages', label: 'Open inbox →' }}
        />
        {msgs.length === 0 ? (
          <EmptyState
            icon="✉️"
            title="No messages yet"
            body={
              <>
                Need something custom or have a question?{' '}
                <Link to="/client/messages" className="font-semibold text-brand-700 hover:underline">
                  Send us a message
                </Link>
                .
              </>
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {msgs.slice(0, 4).map((m, idx) => (
              <li key={m._id}>
                <Link
                  to={`/client/messages/${m._id}`}
                  className="group flex items-center gap-3 px-5 py-4 transition hover:bg-gradient-to-r hover:from-brand-50 hover:to-transparent"
                >
                  <Avatar name={user.name} idx={idx} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-display text-sm font-bold text-slate-900 group-hover:text-brand-700">
                        {m.subject}
                      </span>
                      <StatusBadge status={m.status} />
                    </div>
                    <div className="mt-0.5 truncate text-xs text-slate-500">{m.body}</div>
                  </div>
                  <div className="hidden flex-col items-end text-right text-[11px] text-slate-400 sm:flex">
                    <span>{new Date(m.updatedAt).toLocaleDateString()}</span>
                    <span className="opacity-0 transition group-hover:opacity-100">Open →</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ---------------- pieces ---------------- */

function CardHeader({ icon, title, subtitle, accent, action }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-r ${accent} px-5 py-4 text-white`}>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-lg backdrop-blur">
            {icon}
          </div>
          <div>
            <h2 className="font-display text-lg font-bold leading-tight">{title}</h2>
            {subtitle && <p className="text-xs text-white/85">{subtitle}</p>}
          </div>
        </div>
        {action && (
          <Link
            to={action.to}
            className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur transition hover:bg-white/25"
          >
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}

function StatCard({ to, tone, icon, label, value, hint }) {
  const tones = {
    brand: 'from-brand-50 to-brand-100 text-brand-700 ring-brand-200',
    emerald: 'from-emerald-50 to-emerald-100 text-emerald-700 ring-emerald-200',
    sky: 'from-sky-50 to-sky-100 text-sky-700 ring-sky-200',
    rose: 'from-rose-50 to-rose-100 text-rose-700 ring-rose-200',
  };
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tones[tone].split(' ').slice(0, 2).join(' ')} opacity-80`}
      />
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl ring-1 ${tones[tone]}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
          <div className="truncate font-display text-xl font-extrabold text-slate-900">{value}</div>
          <div className="truncate text-xs text-slate-500">{hint}</div>
        </div>
        <div className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600">
          →
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ icon, title, body }) {
  return (
    <div className="px-5 py-10 text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-3xl">
        {icon}
      </div>
      <div className="font-display text-sm font-bold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-500">{body}</div>
    </div>
  );
}

function Avatar({ name, idx }) {
  // Deterministic gradient palette based on index for variety
  const palettes = [
    'from-brand-400 to-indigo-500',
    'from-emerald-400 to-teal-500',
    'from-amber-400 to-rose-500',
    'from-sky-400 to-violet-500',
  ];
  const initials = (name || '?')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${palettes[idx % palettes.length]} font-display text-sm font-bold text-white shadow-soft`}
    >
      {initials}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    open: 'bg-amber-100 text-amber-700 ring-amber-200',
    replied: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    closed: 'bg-slate-100 text-slate-600 ring-slate-200',
  };
  const icons = { open: '⏳', replied: '✓', closed: '✓' };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ${map[status] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}
    >
      <span>{icons[status] || '•'}</span>
      {status}
    </span>
  );
}

/* ---------- helpers used in JSX above ---------- */
function DecorPattern() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full opacity-20"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id="client-decor" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M6 0 L0 0 L0 6" fill="none" stroke="white" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#client-decor)" />
    </svg>
  );
}
