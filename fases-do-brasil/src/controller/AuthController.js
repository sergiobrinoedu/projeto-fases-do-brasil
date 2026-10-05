import { bus } from '@/infra/EventBus.js';
import { session } from '@/auth/Session.js';
import { toast } from '@/components/Toast.js';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Só aceita caminhos internos como destino pós-login (evita open redirect). */
const safeNext = (n) => (typeof n === 'string' && /^\/(?!\/)/.test(n) && !n.startsWith('/login') ? n : '/');

/** Controller: login, cadastro, Google e logout. */
export class AuthController {
  #gsi = null;

  constructor({ auth, view, router, pages, progress }) {
    Object.assign(this, { auth, view, router, pages, progress });
  }

  init() {
    this.view.render();
    this.view.on({
      switch: (mode) => this.#switch(mode),
      submit: (form, data) => this.#submit(form, data),
      logout: () => this.logout(),
    });
    bus.on('auth:logout-request', () => this.logout());
    bus.on('auth:changed', ({ user }) => this.view.setUser(user));
    this.view.setUser(session.user);
    this.#setupGoogle();
  }

  /** Rota /login (?cadastro abre a área de cadastro; ?next=/caminho volta depois do login). */
  show() {
    const q = new URLSearchParams(location.search);
    this.pages.show('login');
    if (!session.isAuthenticated) this.view.setMode(q.has('cadastro') ? 'register' : this.view.mode, { focus: matchMedia('(hover: hover)').matches });
  }

  #switch(mode) {
    this.view.setMode(mode, { focus: true });
    const q = new URLSearchParams(location.search);
    q.delete('cadastro');
    const rest = q.toString();
    history.replaceState(null, '', `/login${mode === 'register' ? `?cadastro${rest ? `&${rest}` : ''}` : rest ? `?${rest}` : ''}`);
  }

  #validate(form, d) {
    const err = (name, msg) => { this.view.fieldError(form, name, msg); return false; };
    if (form === 'register' && String(d.name ?? '').trim().length < 2) return err('name', 'Informe seu nome.');
    if (!EMAIL_RE.test(String(d.email ?? '').trim())) return err('email', 'Informe um e-mail válido.');
    if (form === 'register') {
      if ((d.password ?? '').length < 8) return err('password', 'A senha deve ter pelo menos 8 caracteres.');
      if (d.password !== d.confirm) return err('confirm', 'As senhas não conferem.');
    } else if (!d.password) return err('password', 'Informe sua senha.');
    return true;
  }

  async #submit(form, d) {
    this.view.clearErrors();
    if (!this.#validate(form, d)) return;
    this.view.busy(form, true);
    try {
      const user = form === 'register'
        ? await this.auth.register({ name: d.name, email: d.email, password: d.password })
        : await this.auth.login({ email: d.email, password: d.password });
      this.#welcome(user, form === 'register');
    } catch (e) {
      if (e.field) this.view.fieldError(form, e.field, e.message);
      else this.view.formError(form, e.message);
    } finally {
      this.view.busy(form, false);
    }
  }

  #welcome(user, isNew) {
    this.view.resetForms();
    toast(isNew ? `Conta criada! Bem-vindo(a), ${user.name.split(' ')[0]}.` : `Bem-vindo(a) de volta, ${user.name.split(' ')[0]}!`);
    this.router.navigate(safeNext(new URLSearchParams(location.search).get('next')));
  }

  async logout() {
    await this.auth.logout();
    this.progress.clearLocal();
    toast('Você saiu da conta. Até logo!', 'info');
    if (document.body.dataset.page === 'login') this.view.setMode('login');
  }

  // ---- Google Identity Services (biblioteca oficial do Google) ----
  #loadGsi() {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) return resolve();
      const s = Object.assign(document.createElement('script'), { src: GSI_SRC, async: true, defer: true });
      s.onload = resolve;
      s.onerror = () => reject(new Error('gsi'));
      document.head.append(s);
    });
  }

  async #setupGoogle() {
    if (!this.auth.googleEnabled) return this.view.renderGoogle(null);
    try {
      await this.#loadGsi();
    } catch {
      return this.view.renderGoogle(null);
    }
    window.google.accounts.id.initialize({
      client_id: this.auth.googleClientId,
      auto_select: false,
      callback: async ({ credential }) => {
        try {
          const user = await this.auth.loginWithGoogle(credential);
          this.#welcome(user, false);
        } catch (e) {
          const form = this.view.mode;
          this.view.formError(form, e.message);
          toast(e.message, 'error', 5000);
        }
      },
    });
    const render = () => this.view.renderGoogle((el, text) => {
      el.innerHTML = '';
      const w = Math.max(200, Math.min(400, Math.round(el.getBoundingClientRect().width) || 320));
      window.google.accounts.id.renderButton(el, { type: 'standard', theme: 'filled_black', size: 'large', shape: 'pill', text, logo_alignment: 'left', locale: 'pt-BR', width: w });
    });
    render();
    bus.on('page:changed', ({ name }) => name === 'login' && !session.isAuthenticated && setTimeout(render, 50));
  }
}
