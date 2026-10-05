import { session } from '@/auth/Session.js';
import { bus } from '@/infra/EventBus.js';

/**
 * Ponto de extensão para autenticação (ex.: área de professor para editar fases).
 * Hoje a aplicação é pública; este serviço já expõe o contrato para integrar
 * um endpoint real (POST /api/auth/login) sem alterar Controllers ou Views.
 */
export class AuthService {
  async login(/* credentials */) {
    throw new Error('Login ainda não habilitado: integre com POST /api/auth/login.');
  }

  logout() {
    session.clear();
    bus.emit('auth:changed', { role: session.role });
  }

  get current() {
    return { user: session.user, role: session.role, authenticated: session.isAuthenticated };
  }
}
