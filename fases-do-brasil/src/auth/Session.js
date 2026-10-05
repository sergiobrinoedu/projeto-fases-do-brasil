/**
 * Singleton de sessão. Guarda usuário/papel/token (sessionStorage com fallback em memória).
 * Visitantes (guest) são o padrão: a página é pública.
 */
class Session {
  #state = { user: null, role: 'guest', token: null };

  constructor() {
    try {
      const raw = sessionStorage.getItem('fdb.session');
      if (raw) this.#state = { ...this.#state, ...JSON.parse(raw) };
    } catch { /* storage indisponível: segue em memória */ }
  }

  get user() { return this.#state.user; }
  get role() { return this.#state.role; }
  get token() { return this.#state.token; }
  get isAuthenticated() { return Boolean(this.#state.token); }

  set(next) {
    this.#state = { ...this.#state, ...next };
    try { sessionStorage.setItem('fdb.session', JSON.stringify(this.#state)); } catch { /* noop */ }
  }

  clear() {
    this.#state = { user: null, role: 'guest', token: null };
    try { sessionStorage.removeItem('fdb.session'); } catch { /* noop */ }
  }
}

export const session = new Session();
