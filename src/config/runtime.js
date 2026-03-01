export const runtime = {
  useBackend: String(import.meta.env.VITE_USE_BACKEND || 'false').toLowerCase() === 'true',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
};

export default runtime;
