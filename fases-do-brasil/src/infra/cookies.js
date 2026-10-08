/** Cookies simples (progresso do visitante sem conta). */
export const cookies = {
  get(name) {
    const m = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
    if (!m) return null;
    try { return decodeURIComponent(m.slice(name.length + 1)); } catch { return null; }
  },
  set(name, value, days = 400) {
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${days * 86400}; Path=/; SameSite=Lax${secure}`;
  },
  remove(name) { document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`; },
};
