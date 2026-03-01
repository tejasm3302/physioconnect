import runtime from '../config/runtime';

const accessTokenKey = 'physioconnect_access_token';

export function getAccessToken() {
  return localStorage.getItem(accessTokenKey);
}

export function setAccessToken(token) {
  if (!token) return;
  localStorage.setItem(accessTokenKey, token);
}

export function clearAccessToken() {
  localStorage.removeItem(accessTokenKey);
}

function buildUrl(path) {
  const base = String(runtime.apiBaseUrl || '').replace(/\/+$/, '');
  let normalizedPath = path.startsWith('/') ? path : `/${path}`;

  // Avoid duplicate '/api' when reverse proxy base already includes it.
  if (base.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    normalizedPath = normalizedPath.slice(4);
  }

  return `${base}${normalizedPath}`;
}

async function request(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
    credentials: 'include'
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Request failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export const apiClient = {
  request,
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body || {}) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body || {}) })
};

export default apiClient;