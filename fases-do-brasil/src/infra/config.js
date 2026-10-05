export const config = Object.freeze({
  apiBase: import.meta.env?.VITE_API_URL ?? '/api',
  apiTimeoutMs: 3500,
  authTimeoutMs: 12000, // login/cadastro (bcrypt + rede lenta)
});
