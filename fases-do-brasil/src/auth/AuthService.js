import { session } from '@/auth/Session.js';
import { bus } from '@/infra/EventBus.js';
import { ApiClient } from '@/infra/http/ApiClient.js';

/** Serviço de autenticação do front: conversa com /api/auth/* e mantém a Session. */
export class AuthService {
  googleClientId = null;

  constructor(api = new ApiClient()) {
    this.api = api;
  }

  /** Restaura a sessão (cookie) e lê a configuração do login Google. Nunca lança. */
  async init() {
    const [me, cfg] = await Promise.allSettled([this.api.get('/auth/me'), this.api.get('/auth/config')]);
    if (cfg.status === 'fulfilled') this.googleClientId = cfg.value.googleClientId;
    if (me.status === 'fulfilled') session.set(me.value.user);
    return this.current;
  }

  get googleEnabled() { return Boolean(this.googleClientId); }

  get current() {
    return { user: session.user, role: session.role, authenticated: session.isAuthenticated };
  }

  async #enter(promise) {
    const { user } = await promise;
    session.set(user);
    bus.emit('auth:changed', { user, reason: 'login' });
    return user;
  }

  register(data) { return this.#enter(this.api.post('/auth/register', data)); }
  login(data) { return this.#enter(this.api.post('/auth/login', data)); }
  loginWithGoogle(credential) { return this.#enter(this.api.post('/auth/google', { credential })); }

  async logout() {
    try { await this.api.post('/auth/logout'); } catch { /* o cookie expira sozinho no servidor */ }
    session.clear();
    bus.emit('auth:changed', { user: null, reason: 'logout' });
  }
}
