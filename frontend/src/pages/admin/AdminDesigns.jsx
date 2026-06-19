import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { api, fileUrl } from '../../utils/api.js';

const CATEGORIES = [
  'floral',
  'geometric',
  'lettering',
  'animals',
  'logos',
  'religious',
  'kids',
  'custom',
];

export default function AdminDesigns() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category !== 'all') params.set('category', category);
    api.get(`/admin/designs?${params.toString()}`)
      .then((d) => { setItems(d.items || []); setTotal(d.total || 0); })
      .finally(() => setLoading(false));
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, category]);

  async function remove(id) {
    if (!confirm('Delete this design permanently?')) return;
    try {
      await api.del(`/admin/designs/${id}`);
      toast.success('Deleted.');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">Designs</h1>
          <p className="text-slate-500">{total} design{total === 1 ? '' : 's'} uploaded.</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>
          + Upload design
        </button>
      </div>

      <div className="card flex flex-col gap-3 p-4 sm:flex-row">
        <input
          type="search"
          className="input flex-1"
          placeholder="Search title, description, tags…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="input sm:w-48"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="capitalize">{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading…</div>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">No designs yet. Upload one!</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Downloads</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((d) => (
                <tr key={d._id}>
                  <td className="px-4 py-3">
                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100">
                      {d.fileMime?.startsWith('image/') ? (
                        <img src={fileUrl(d.fileUrl)} alt={d.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-slate-400">
                          {d.fileName.split('.').pop()?.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{d.title}</div>
                    <div className="line-clamp-1 text-xs text-slate-500">{d.description}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">{d.category}</td>
                  <td className="px-4 py-3">${Number(d.price).toFixed(2)}</td>
                  <td className="px-4 py-3">{d.downloadCount}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="btn-ghost" onClick={() => { setEditing(d); setShowForm(true); }}>
                        Edit
                      </button>
                      <button className="btn-danger" onClick={() => remove(d._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <DesignFormModal
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}

function DesignFormModal({ initial, onClose, onSaved }) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    category: initial?.category || 'floral',
    tags: (initial?.tags || []).join(', '),
    price: initial?.price ?? 0,
    currency: initial?.currency || 'USD',
    isPublished: initial?.isPublished ?? true,
  });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef(null);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      if (isEdit) {
        await api.put(`/admin/designs/${initial._id}`, {
          ...form,
          tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
        });
        toast.success('Updated.');
        onSaved();
      } else {
        if (!file) {
          toast.error('Please choose a file.');
          setBusy(false);
          return;
        }
        const fd = new FormData();
        fd.append('file', file);
        for (const [k, v] of Object.entries(form)) {
          if (k === 'tags') fd.append(k, v.split(',').map((s) => s.trim()).filter(Boolean).join(','));
          else fd.append(k, v);
        }
        // Use XHR for progress
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/admin/designs');
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
            else {
              try { reject(new Error(JSON.parse(xhr.responseText).message || 'Upload failed.')); }
              catch { reject(new Error('Upload failed.')); }
            }
          };
          xhr.onerror = () => reject(new Error('Network error.'));
          const token = localStorage.getItem('embroidery.token');
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.send(fd);
        });
        toast.success('Uploaded.');
        onSaved();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4">
      <form onSubmit={submit} className="card w-full max-w-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900">
            {isEdit ? 'Edit design' : 'Upload new design'}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Title</label>
            <input className="input" required value={form.title} onChange={(e) => update('title', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea className="input min-h-[100px]" required value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => update('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Tags (comma separated)</label>
            <input className="input" value={form.tags} onChange={(e) => update('tags', e.target.value)} />
          </div>
          <div>
            <label className="label">Price (USD)</label>
            <input type="number" min="0" step="0.01" className="input" value={form.price} onChange={(e) => update('price', e.target.value)} />
          </div>
          <div>
            <label className="label">Currency</label>
            <input className="input" maxLength={3} value={form.currency} onChange={(e) => update('currency', e.target.value.toUpperCase())} />
          </div>
          {!isEdit && (
            <div className="sm:col-span-2">
              <label className="label">File (image or embroidery format)</label>
              <input
                ref={fileRef}
                type="file"
                className="input"
                accept="image/*,.svg,.pdf,.ai,.eps,.dst,.pes,.exp,.vp3,.hus,.jef"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file && (
                <div className="mt-2 text-xs text-slate-500">
                  {file.name} · {(file.size / 1024).toFixed(1)} KB
                </div>
              )}
              {progress > 0 && progress < 100 && (
                <div className="mt-2 h-2 w-full overflow-hidden rounded bg-slate-100">
                  <div className="h-full bg-brand-600" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => update('isPublished', e.target.checked)}
              />
              Published (visible on public site)
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={busy}>
            {busy ? (isEdit ? 'Saving…' : 'Uploading…') : (isEdit ? 'Save changes' : 'Upload')}
          </button>
        </div>
      </form>
    </div>
  );
}
