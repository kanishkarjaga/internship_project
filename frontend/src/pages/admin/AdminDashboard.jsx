import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api.js';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/overview').then(setData).catch(() => {});
  }, []);

  if (!data) return <div className="text-slate-500">Loading…</div>;

  const { counts, recentMessages, recentClients, recentLogs, settings } = data;

  return (
    <div className="space-y-6">
      {/* Hero strip */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-brand-800 to-indigo-700 p-6 text-white shadow-soft sm:p-8">
        <DecorPattern />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-200/80">
              Admin overview
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">
              {settings.businessName}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-brand-100/90">
              {settings.tagline}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/designs"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 shadow-soft transition hover:bg-brand-50"
            >
              🧵 Manage designs
            </Link>
            <Link
              to="/admin/messages"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/20"
            >
              ✉️ Inbox ({counts.openMessages})
            </Link>
          </div>
        </div>
      </section>

      {/* Counters */}
      <div className="grid gap-4 sm:grid-cols-3">
        <BigStat
          to="/admin/designs"
          accent="from-brand-500 to-indigo-500"
          icon="🧵"
          label="Designs uploaded"
          value={counts.designs}
          hint="Total files in library"
        />
        <BigStat
          to="/admin/clients"
          accent="from-emerald-500 to-teal-500"
          icon="👥"
          label="Registered clients"
          value={counts.clients}
          hint="Active accounts"
        />
        <BigStat
          to="/admin/messages"
          accent="from-amber-500 to-rose-500"
          icon="✉️"
          label="Open messages"
          value={counts.openMessages}
          hint="Awaiting your reply"
        />
      </div>

      {/* Messages + Clients */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PanelCard
          icon="✉️"
          title="Recent messages"
          subtitle="Threads from clients and the contact form"
          accent="from-amber-500 to-rose-500"
          linkTo="/admin/messages"
          emptyText="No messages yet."
        >
          {recentMessages.map((m) => (
            <Link
              key={m._id}
              to={`/admin/messages/${m._id}`}
              className="group flex items-center gap-3 px-5 py-4 transition hover:bg-gradient-to-r hover:from-amber-50 hover:to-transparent"
            >
              <Avatar name={m.client?.name || m.contactName || 'Visitor'} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-display text-sm font-bold text-slate-900 group-hover:text-brand-700">
                    {m.subject}
                  </span>
                  <StatusPill status={m.status} />
                </div>
                <div className="truncate text-xs text-slate-500">
                  <span className="font-medium text-slate-600">
                    {m.client?.name || m.contactName}
                  </span>
                  {' · '}
                  {m.body}
                </div>
              </div>
              <span className="hidden text-[11px] text-slate-400 sm:inline">
                {new Date(m.updatedAt).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </PanelCard>

        <PanelCard
          icon="👥"
          title="Recent clients"
          subtitle="Newly registered accounts"
          accent="from-emerald-500 to-teal-500"
          linkTo="/admin/clients"
          emptyText="No clients yet."
        >
          {recentClients.map((u) => (
            <Link
              key={u._id}
              to="/admin/clients"
              className="group flex items-center gap-3 px-5 py-4 transition hover:bg-gradient-to-r hover:from-emerald-50 hover:to-transparent"
            >
              <Avatar name={u.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-display text-sm font-bold text-slate-900 group-hover:text-brand-700">
                    {u.name}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ${
                      u.isActive
                        ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
                        : 'bg-rose-100 text-rose-700 ring-rose-200'
                    }`}
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
                    {u.isActive ? 'active' : 'disabled'}
                  </span>
                </div>
                <div className="truncate text-xs text-slate-500">{u.email}</div>
              </div>
              <span className="hidden text-[11px] text-slate-400 sm:inline">
                {new Date(u.createdAt).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </PanelCard>
      </div>

      {/* Activity */}
      <section className="card overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-700 to-slate-900 px-5 py-4 text-white">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-lg backdrop-blur">
                📜
              </div>
              <div>
                <h2 className="font-display text-lg font-bold leading-tight">Activity log</h2>
                <p className="text-xs text-white/80">Latest admin & client actions</p>
              </div>
            </div>
            <Link
              to="/admin/activity"
              className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur transition hover:bg-white/25"
            >
              Full log →
            </Link>
          </div>
        </div>
        <ul className="divide-y divide-slate-100">
          {recentLogs.map((l) => (
            <li key={l._id} className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50">
              <span className="rounded-lg bg-slate-900 px-2 py-1 font-mono text-[11px] font-semibold text-white">
                {l.action}
              </span>
              <span className="truncate text-sm text-slate-700">
                {l.actor?.name || l.actorRole}
              </span>
              <span className="ml-auto text-xs text-slate-400">
                {new Date(l.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
          {recentLogs.length === 0 && (
            <li className="px-5 py-6 text-center text-sm text-slate-500">No activity yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}

/* ---------------- pieces ---------------- */

function PanelCard({ icon, title, subtitle, accent, linkTo, emptyText, children }) {
  const arr = Array.isArray(children) ? children : [children];
  const has = arr.some(Boolean);
  return (
    <section className="card overflow-hidden">
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
          {linkTo && (
            <Link
              to={linkTo}
              className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur transition hover:bg-white/25"
            >
              All →
            </Link>
          )}
        </div>
      </div>
      {has ? (
        <ul className="divide-y divide-slate-100">{arr}</ul>
      ) : (
        <div className="px-5 py-8 text-center text-sm text-slate-500">{emptyText}</div>
      )}
    </section>
  );
}

function BigStat({ to, accent, icon, label, value, hint }) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent} opacity-80`} />
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-2xl text-white shadow-soft`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </div>
          <div className="font-display text-3xl font-extrabold text-slate-900">{value}</div>
          <div className="truncate text-xs text-slate-500">{hint}</div>
        </div>
        <div className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600">
          →
        </div>
      </div>
    </Link>
  );
}

function Avatar({ name }) {
  const palettes = [
    'from-brand-400 to-indigo-500',
    'from-emerald-400 to-teal-500',
    'from-amber-400 to-rose-500',
    'from-sky-400 to-violet-500',
    'from-fuchsia-400 to-pink-500',
  ];
  const idx =
    (name || '?')
      .split('')
      .reduce((a, c) => a + c.charCodeAt(0), 0) % palettes.length;
  const initials = (name || '?')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${palettes[idx]} font-display text-sm font-bold text-white shadow-soft`}
    >
      {initials}
    </div>
  );
}

function StatusPill({ status }) {
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

function DecorPattern() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full opacity-20"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id="admin-decor" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M6 0 L0 0 L0 6" fill="none" stroke="white" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#admin-decor)" />
    </svg>
  );
}
