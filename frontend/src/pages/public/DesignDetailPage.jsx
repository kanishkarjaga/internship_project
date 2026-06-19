import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, fileUrl } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

export default function DesignDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { add } = useCart();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(`/designs/${id}`)
      .then((d) => setDesign(d.design))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function download() {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    const a = document.createElement('a');
    a.href = `/api/me/designs/${id}/download`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function addToCart() {
    add(design, quantity);
    toast.success(`Added ${quantity} × "${design.title}" to cart`);
  }

  function buyNow() {
    add(design, quantity);
    if (!user) {
      navigate(`/login?next=${encodeURIComponent('/client/cart')}`);
      return;
    }
    navigate('/client/cart');
  }

  if (loading) return <div className="mx-auto max-w-5xl p-8 text-slate-500">Loading…</div>;
  if (!design) return <div className="mx-auto max-w-5xl p-8 text-slate-500">Design not found.</div>;

  const isImage = design.fileMime?.startsWith('image/');
  const total = (Number(design.price) * quantity).toFixed(2);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[2fr_1fr]">
      <div className="card overflow-hidden">
        <div className="flex aspect-square items-center justify-center bg-slate-100">
          {isImage ? (
            <img src={fileUrl(design.fileUrl)} alt={design.title} className="h-full w-full object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <div className="text-6xl">🧵</div>
              <div className="text-sm uppercase tracking-wide">{design.fileName}</div>
              <div className="text-xs">{design.fileMime}</div>
            </div>
          )}
        </div>
      </div>
      <aside>
        <span className="badge capitalize">{design.category}</span>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-slate-900">{design.title}</h1>
        <p className="mt-2 text-slate-600">{design.description}</p>

        <div className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-slate-100">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-3xl font-extrabold text-brand-700">
              ${Number(design.price).toFixed(2)}
            </span>
            <span className="text-xs uppercase text-slate-400">{design.currency}</span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">Quantity</span>
            <div className="flex items-center rounded-xl ring-1 ring-slate-200">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                aria-label="decrease"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-12 border-x border-slate-200 bg-white py-1.5 text-center text-sm focus:outline-none"
              />
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                aria-label="increase"
              >
                +
              </button>
            </div>
            <span className="ml-auto text-sm text-slate-500">
              Total: <span className="font-bold text-slate-900">${total}</span>
            </span>
          </div>

          <button onClick={buyNow} className="btn-primary mt-4 w-full">
            🛒 Buy now
          </button>
          <button onClick={addToCart} className="btn-ghost mt-2 w-full">
            Add to cart
          </button>
          <button onClick={download} className="btn-ghost mt-2 w-full !text-slate-500">
            ⬇ {user ? 'Just download the file' : 'Login to download'}
          </button>
        </div>

        <div className="mt-6 text-sm text-slate-500">
          <div>Downloads: <span className="font-medium text-slate-700">{design.downloadCount}</span></div>
          <div>File: <span className="font-medium text-slate-700">{design.fileName}</span></div>
          <div>Size: <span className="font-medium text-slate-700">{Math.round(design.fileSize / 1024)} KB</span></div>
        </div>
      </aside>
    </div>
  );
}
