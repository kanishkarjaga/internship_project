import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fileUrl } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const CATEGORIES = ['all', 'floral', 'geometric', 'lettering', 'animals', 'logos', 'religious', 'kids', 'custom'];

export default function GalleryPage() {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const detailPath = useMemo(
    () => (id) => (user ? `/client/design/${id}` : `/design/${id}`),
    [user]
  );

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const url = new URLSearchParams();
    if (category !== 'all') url.set('category', category);
    if (q) url.set('q', q);
    api.get(`/public/designs?${url.toString()}`)
      .then((d) => alive && setItems(d.items || []))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [q, category]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">Design gallery</h1>
          <p className="text-slate-500">Browse our computer embroidery library.</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <input
            type="search"
            className="input sm:w-64"
            placeholder="Search designs…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize ring-1 transition ${
              category === c
                ? 'bg-brand-600 text-white ring-brand-600'
                : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-72 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">No designs match your search.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((d) => (
            <Link
              key={d._id}
              to={detailPath(d._id)}
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
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                    <div className="text-4xl">🧵</div>
                    <div className="text-xs uppercase tracking-wide">{d.fileName.split('.').pop()}</div>
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
                <h3 className="mt-2 line-clamp-1 font-display font-bold text-slate-900">{d.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{d.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
