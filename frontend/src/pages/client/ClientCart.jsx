import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

export default function ClientCart() {
  const { user } = useAuth();
  const { items, setQuantity, remove, clear, totals } = useCart();
  const [shipping, setShipping] = useState({
    name: user?.name || '',
    company: user?.company || '',
    address: user?.address || '',
    phone: user?.phone || '',
    notes: '',
  });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  function update(k, v) {
    setShipping((s) => ({ ...s, [k]: v }));
  }

  async function placeOrder() {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent('/client/cart')}`);
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    setBusy(true);
    try {
      const created = await api.post('/orders', {
        cart: items.map((it) => ({ designId: it.designId, quantity: it.quantity })),
        shipping,
        notes: shipping.notes,
      });
      const checkout = await api.post(`/orders/${created.order._id}/checkout`);
      toast.success('Order created — opening payment…');
      if (checkout.checkoutUrl) {
        // Both mock-pay and stripe redirect to the frontend
        window.location.href = checkout.checkoutUrl;
      } else {
        navigate(`/client/orders/${created.order._id}?paid=1`);
        clear();
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card flex flex-col items-center gap-4 p-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-100 to-brand-200 text-4xl">
            🛒
          </div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">Your cart is empty</h1>
          <p className="max-w-md text-sm text-slate-500">
            Browse the design library and add a few patterns to get started.
          </p>
          <Link to="/client/gallery" className="btn-primary mt-2">
            Browse designs →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h1 className="font-display text-lg font-bold text-slate-900">
            Cart ({totals.count} {totals.count === 1 ? 'item' : 'items'})
          </h1>
          <button onClick={clear} className="text-xs font-medium text-rose-600 hover:underline">
            Clear cart
          </button>
        </div>
        <ul className="divide-y divide-slate-100">
          {items.map((it) => (
            <li key={it.designId} className="flex items-center gap-4 px-5 py-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                {it.thumbnail ? (
                  <img src={it.thumbnail} alt={it.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xl text-slate-400">🧵</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/client/design/${it.designId}`}
                  className="line-clamp-1 font-display text-sm font-bold text-slate-900 hover:text-brand-700"
                >
                  {it.title}
                </Link>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                  <span className="badge !px-1.5 !py-0 !text-[10px] capitalize">{it.category}</span>
                  <span>${Number(it.price).toFixed(2)} each</span>
                </div>
              </div>
              <div className="flex items-center rounded-xl ring-1 ring-slate-200">
                <button
                  onClick={() => setQuantity(it.designId, it.quantity - 1)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                  aria-label="decrease"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={it.quantity}
                  onChange={(e) => setQuantity(it.designId, e.target.value)}
                  className="w-12 border-x border-slate-200 bg-white py-1.5 text-center text-sm focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(it.designId, it.quantity + 1)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-50"
                  aria-label="increase"
                >
                  +
                </button>
              </div>
              <div className="w-20 text-right font-display text-sm font-bold text-slate-900">
                ${(it.price * it.quantity).toFixed(2)}
              </div>
              <button
                onClick={() => remove(it.designId)}
                className="ml-2 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                title="Remove"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>

      <aside className="space-y-4">
        <section className="card overflow-hidden">
          <div className="bg-gradient-to-r from-brand-500 to-indigo-500 px-5 py-3 text-white">
            <h2 className="font-display text-base font-bold">Shipping</h2>
          </div>
          <div className="space-y-3 p-5">
            <div>
              <label className="label">Name</label>
              <input className="input" value={shipping.name} onChange={(e) => update('name', e.target.value)} />
            </div>
            <div>
              <label className="label">Company (optional)</label>
              <input className="input" value={shipping.company} onChange={(e) => update('company', e.target.value)} />
            </div>
            <div>
              <label className="label">Address</label>
              <input className="input" value={shipping.address} onChange={(e) => update('address', e.target.value)} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={shipping.phone} onChange={(e) => update('phone', e.target.value)} />
            </div>
            <div>
              <label className="label">Notes (optional)</label>
              <textarea
                className="input min-h-[64px]"
                value={shipping.notes}
                onChange={(e) => update('notes', e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="space-y-1 p-5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="text-slate-400">calculated by admin</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-slate-100 pt-3">
              <span className="font-display text-base font-bold text-slate-900">Estimated total</span>
              <span className="font-display text-2xl font-extrabold text-brand-700">
                ${totals.subtotal.toFixed(2)}
              </span>
            </div>
            <button onClick={placeOrder} className="btn-primary mt-4 w-full" disabled={busy}>
              {busy ? 'Placing order…' : 'Place order & pay'}
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              Secure checkout · Card or local mock
            </p>
          </div>
        </section>
      </aside>
    </div>
  );
}
