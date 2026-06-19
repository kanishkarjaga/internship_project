import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api, fileUrl } from '../../utils/api.js';
import { useSettings } from '../../context/SettingsContext.jsx';

export default function HomePage() {
  const { settings } = useSettings();
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get('/public/designs?limit=6').then((d) => setRecent(d.items || [])).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 text-white">
        <div className="absolute inset-0 opacity-30">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
            <defs>
              <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
                <path d="M6 0 L0 0 L0 6" fill="none" stroke="white" strokeOpacity="0.18" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="badge mb-4 !bg-white/15 !text-white">Computer-precise embroidery</span>
            <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              {settings.businessName}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-brand-100">
              {settings.tagline}
            </p>
            <p className="mt-6 max-w-xl text-sm text-brand-100/90">
              {settings.aboutText}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/gallery" className="btn-primary !bg-white !text-brand-700 hover:!bg-brand-50">
                Browse designs →
              </Link>
              <Link
                to="/contact"
                className="btn-ghost !bg-white/10 !text-white !ring-white/30 hover:!bg-white/20"
              >
                Request a quote
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-brand-100/90">
              <span>📞 {settings.contactPhone}</span>
              <span>✉️ {settings.contactEmail}</span>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative h-full w-full overflow-hidden rounded-3xl ring-1 ring-white/20 shadow-soft">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)] opacity-20" />
              <div className="grid h-full grid-cols-3 grid-rows-3 gap-3 p-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/15"
                    style={{ transform: `rotate(${(i % 3) * 2 - 2}deg)` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent designs */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Recently added</h2>
            <p className="text-sm text-slate-500">Fresh uploads from our design library.</p>
          </div>
          <Link to="/gallery" className="text-sm font-medium text-brand-700 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((d) => (
            <Link
              to={`/design/${d._id}`}
              key={d._id}
              className="card group overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-[4/3] bg-slate-100">
                {d.fileUrl && d.fileMime?.startsWith('image/') ? (
                  <img
                    src={fileUrl(d.fileUrl)}
                    alt={d.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    🧵 {d.fileName.split('.').pop()?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="badge capitalize">{d.category}</span>
                  <span className="text-sm font-semibold text-slate-900">
                    ${Number(d.price).toFixed(2)}
                  </span>
                </div>
                <h3 className="mt-2 line-clamp-1 font-display font-bold text-slate-900">
                  {d.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{d.description}</p>
              </div>
            </Link>
          ))}
          {recent.length === 0 && (
            <div className="col-span-full card p-8 text-center text-slate-500">
              No designs uploaded yet. Check back soon!
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-3">
          <Feature icon="🧵" title="Custom patterns" body="From logos to one-of-a-kind artwork, digitized for embroidery." />
          <Feature icon="⚡" title="Fast turnaround" body="Most orders ship within 5–7 business days." />
          <Feature icon="📦" title="Bulk orders" body="Need 100 pieces? Talk to us about volume pricing." />
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, body }) {
  return (
    <div className="card p-6">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-3 font-display text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{body}</p>
    </div>
  );
}
