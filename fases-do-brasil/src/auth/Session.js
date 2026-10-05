/**
 * Singleton de sessão (somente memória). O login real vive no cookie httpOnly
 * enviado pelo servidor; aqui guardamos apenas o usuário público devolvido por /api/auth/me.
 */
class Session {
  #user = null;

  get user() { return this.#user; }
  get isAuthenticated() { return Boolean(this.#user); }
  get role() { return this.#user ? (this.#user.role === 'editor' ? 'editor' : 'member') : 'guest'; }

  set(user) { this.#user = user ?? null; }
  clear() { this.#user = null; }
}

export const session = new Session();
