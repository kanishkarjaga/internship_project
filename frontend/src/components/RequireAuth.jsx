import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RequireAuth({ role, children }) {
  const { user } = useAuth();
  const loc = useLocation();

  if (!user) {
    const target = role ? `?next=${encodeURIComponent(loc.pathname)}` : '';
    return <Navigate to={`/login${target}`} replace />;
  }
  if (role && user.role !== role) {
    // Don't let clients wander into admin and vice versa
    return <Navigate to={user.role === 'admin' ? '/admin' : '/client'} replace />;
  }
  return children;
}
