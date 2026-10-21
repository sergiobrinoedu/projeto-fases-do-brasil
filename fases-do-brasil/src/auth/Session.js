/**
 * Singleton de sessão do visitante. Guarda papel/token da sessão do navegador
 * (sessionStorage com fallback em memória). Não há contas: todo visitante é "guest";
 * o progresso de leitura fica em localStorage + cookie (ver ProgressService/ProgressCookie).
 */
class Session {
  #state = { role: 'guest', token: null };

  constructor() {
    try {
      const raw = sessionStorage.getItem('fdb.session');
      if (raw) this.#state = { ...this.#state, ...JSON.parse(raw) };
    } catch { /* storage indisponível: segue em memória */ }
    if (!this.#state.token) this.set({ token: Session.#newToken() });
  }

  static #newToken() {
    try { return crypto.randomUUID(); } catch { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`; }
  }

  get role() { return this.#state.role; }
  get token() { return this.#state.token; }

  set(next) {
    this.#state = { ...this.#state, ...next };
    try { sessionStorage.setItem('fdb.session', JSON.stringify(this.#state)); } catch { /* noop */ }
  }

  clear() {
    this.#state = { role: 'guest', token: null };
    try { sessionStorage.removeItem('fdb.session'); } catch { /* noop */ }
  }
}

export const session = new Session();
