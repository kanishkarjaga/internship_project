import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setToken, getToken } from '../utils/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) { setUser(null); setLoading(false); return; }
    try {
      const data = await api.get('/auth/me');
      setUser(data.user);
    } catch (_) {
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function login(payload) {
    const data = await api.post('/auth/login', payload);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }
  async function register(payload) {
    const data = await api.post('/auth/register', payload);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }
  function logout() {
    setToken(null);
    setUser(null);
  }
  async function updateProfile(payload) {
    const data = await api.put('/auth/profile', payload);
    setUser(data.user);
    return data.user;
  }
  async function changePassword(payload) {
    await api.put('/auth/password', payload);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refresh, updateProfile, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
