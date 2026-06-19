import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function CartLink({ className = '', children }) {
  const { totals } = useCart();
  return (
    <Link to="/client/cart" className={`relative ${className}`}>
      {children || (
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden>🛒</span>
          <span>Cart</span>
        </span>
      )}
      {totals.count > 0 && (
        <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white shadow-soft">
          {totals.count}
        </span>
      )}
    </Link>
  );
}
