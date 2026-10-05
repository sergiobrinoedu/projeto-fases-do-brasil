export const config = Object.freeze({
  apiBase: import.meta.env?.VITE_API_URL ?? '/api',
  apiTimeoutMs: 3500,
});
