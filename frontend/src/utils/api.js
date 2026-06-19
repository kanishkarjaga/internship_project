const API_BASE = import.meta.env.VITE_API_BASE || '/api';
export const TOKEN_KEY = 'embroidery.token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, headers = {}, isForm = false } = {}) {
  const token = getToken();
  const h = { ...headers };
  if (!isForm && body) h['Content-Type'] = 'application/json';
  if (token) h.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: h,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    setToken(null);
    if (!path.startsWith('/auth/')) {
      // Surface to caller; AuthContext will react via state changes too
    }
  }

  let data = null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) data = await res.json().catch(() => null);
  else data = await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      (typeof data === 'string' ? data : '') ||
      `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.details = data && data.details;
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData) => request(path, { method: 'POST', body: formData, isForm: true }),
};

export function fileUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return url.startsWith('/uploads') ? url : `${API_BASE.replace(/\/api$/, '')}${url}`;
}
