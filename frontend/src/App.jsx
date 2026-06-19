import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './context/AuthContext.jsx';
import { TOKEN_KEY } from './utils/api.js';

import HomePage from './pages/public/HomePage.jsx';
import GalleryPage from './pages/public/GalleryPage.jsx';
import DesignDetailPage from './pages/public/DesignDetailPage.jsx';
import ContactPage from './pages/public/ContactPage.jsx';
import LoginPage from './pages/public/LoginPage.jsx';
import RegisterPage from './pages/public/RegisterPage.jsx';
import MockPayPage from './pages/public/MockPayPage.jsx';

import ClientDashboard from './pages/client/ClientDashboard.jsx';
import ClientMessages from './pages/client/ClientMessages.jsx';
import ClientThread from './pages/client/ClientThread.jsx';
import ClientProfile from './pages/client/ClientProfile.jsx';
import ClientCart from './pages/client/ClientCart.jsx';
import ClientOrders from './pages/client/ClientOrders.jsx';
import ClientOrderDetail from './pages/client/ClientOrderDetail.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminDesigns from './pages/admin/AdminDesigns.jsx';
import AdminClients from './pages/admin/AdminClients.jsx';
import AdminMessages from './pages/admin/AdminMessages.jsx';
import AdminThread from './pages/admin/AdminThread.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';
import AdminActivity from './pages/admin/AdminActivity.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';

import PublicLayout from './components/PublicLayout.jsx';
import ClientLayout from './components/ClientLayout.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import RequireAuth from './components/RequireAuth.jsx';

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const prevPath = useRef(location.pathname);

  // Surface a helpful message if the user landed on a dashboard URL while logged out
  useEffect(() => {
    if (!loading && !user) {
      const onDashboard = /^\/(client|admin)(\/|$)/.test(location.pathname);
      const hadToken = !!localStorage.getItem('embroidery.token');
      if (onDashboard) {
        if (hadToken) {
          toast.error('Your session expired. Please sign in again.');
        } else {
          toast('Please sign in to access that page.', { icon: '🔐' });
        }
      }
    }
    prevPath.current = location.pathname;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, location.pathname]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  return (
    <Routes>
      {/* Mock pay lives outside layouts so it can use its own dark theme */}
      <Route path="/mock-pay" element={<MockPayPage />} />

      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/design/:id" element={<DesignDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Client */}
      <Route
        element={
          <RequireAuth role="client">
            <ClientLayout />
          </RequireAuth>
        }
      >
        <Route path="/client" element={<ClientDashboard />} />
        <Route path="/client/gallery" element={<GalleryPage />} />
        <Route path="/client/design/:id" element={<DesignDetailPage />} />
        <Route path="/client/cart" element={<ClientCart />} />
        <Route path="/client/orders" element={<ClientOrders />} />
        <Route path="/client/orders/:id" element={<ClientOrderDetail />} />
        <Route path="/client/messages" element={<ClientMessages />} />
        <Route path="/client/messages/:id" element={<ClientThread />} />
        <Route path="/client/profile" element={<ClientProfile />} />
      </Route>

      {/* Admin */}
      <Route
        element={
          <RequireAuth role="admin">
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/designs" element={<AdminDesigns />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/clients" element={<AdminClients />} />
        <Route path="/admin/messages" element={<AdminMessages />} />
        <Route path="/admin/messages/:id" element={<AdminThread />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/activity" element={<AdminActivity />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
