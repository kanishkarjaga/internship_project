import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'embroidery.cart.v1';

const CartContext = createContext(null);

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function write(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch (_) {
    /* quota exceeded; ignore */
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => read());

  useEffect(() => {
    write(items);
  }, [items]);

  // Cross-tab sync
  useEffect(() => {
    function onStorage(e) {
      if (e.key === KEY) setItems(read());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((design, quantity = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.designId === String(design._id));
      if (idx >= 0) {
        const next = prev.slice();
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [
        ...prev,
        {
          designId: String(design._id),
          title: design.title,
          price: Number(design.price) || 0,
          currency: design.currency || 'USD',
          thumbnail: design.fileMime?.startsWith('image/') ? design.fileUrl : '',
          category: design.category || '',
          quantity: Math.max(1, quantity),
        },
      ];
    });
  }, []);

  const remove = useCallback((designId) => {
    setItems((prev) => prev.filter((it) => it.designId !== String(designId)));
  }, []);

  const setQuantity = useCallback((designId, quantity) => {
    const q = Math.max(1, parseInt(quantity, 10) || 1);
    setItems((prev) =>
      prev.map((it) => (it.designId === String(designId) ? { ...it, quantity: q } : it))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    return {
      subtotal: +subtotal.toFixed(2),
      count: items.reduce((s, it) => s + it.quantity, 0),
      currency: items[0]?.currency || 'USD',
    };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, add, remove, setQuantity, clear, totals }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};
