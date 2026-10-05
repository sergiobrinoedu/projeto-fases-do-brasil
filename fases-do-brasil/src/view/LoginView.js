import $ from 'jquery';
import { esc } from '@/infra/escape.js';

const EYE = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
const GOOGLE = '<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';

const field = (id, label, type, extra = '') => `
  <div class="auth-field" data-field="${id}">
    <label for="f-${id}">${label}</label>
    <div class="auth-input">
      <input id="f-${id}" name="${id}" type="${type}" required ${extra} aria-describedby="e-${id}" />
      ${type === 'password' ? `<button type="button" class="auth-eye" aria-label="Mostrar senha" aria-pressed="false">${EYE}</button>` : ''}
    </div>
    <p class="auth-error" id="e-${id}" role="alert"></p>
  </div>`;

/** View: página /login — duas áreas (entrar / cadastrar) alternadas pelo botão CADASTRE-SE. */
export class LoginView {
  #h = {};

  constructor(root) {
    this.$root = $(root);
    this.mode = 'login';
  }

  on(handlers) { this.#h = handlers; }

  render() {
    this.$root.html(`
      <div class="auth" data-mode="login">
        <aside class="auth-side">
          <span class="eyebrow">Sua jornada</span>
          <h1>Guarde seu <em>progresso</em></h1>
          <p>Entre com sua conta para salvar as fases que você já leu e continuar de onde parou — em qualquer aparelho.</p>
          <ul class="auth-perks">
            <li>Fases lidas sincronizadas</li><li>Acesso pelo celular, PC ou TV</li><li>Login rápido com o Google</li>
          </ul>
        </aside>

        <div class="auth-main">
          <!-- Área: ENTRAR -->
          <section class="auth-panel" data-panel="login" aria-labelledby="t-login">
            <h2 id="t-login">Entrar</h2>
            <div class="auth-google" data-google="signin_with"></div>
            <div class="auth-or"><span>ou use seu e-mail</span></div>
            <form novalidate data-form="login" autocomplete="on">
              <p class="auth-alert" role="alert" hidden></p>
              ${field('email', 'E-mail', 'email', 'autocomplete="email" inputmode="email" maxlength="160"')}
              ${field('password', 'Senha', 'password', 'autocomplete="current-password" maxlength="72"')}
              <button class="btn-next auth-submit" type="submit"><span>Entrar</span></button>
            </form>
            <p class="auth-switch">Ainda não tem conta?
              <button type="button" class="btn-ghost auth-cta" data-switch="register">CADASTRE-SE</button>
            </p>
          </section>

          <!-- Área: CADASTRAR -->
          <section class="auth-panel" data-panel="register" aria-labelledby="t-reg" hidden>
            <h2 id="t-reg">Criar conta</h2>
            <div class="auth-google" data-google="signup_with"></div>
            <div class="auth-or"><span>ou cadastre com e-mail</span></div>
            <form novalidate data-form="register" autocomplete="on">
              <p class="auth-alert" role="alert" hidden></p>
              ${field('name', 'Nome', 'text', 'autocomplete="name" maxlength="100"')}
              ${field('email', 'E-mail', 'email', 'autocomplete="email" inputmode="email" maxlength="160"')}
              ${field('password', 'Senha (mín. 8 caracteres)', 'password', 'autocomplete="new-password" maxlength="72"')}
              <div class="auth-meter" aria-hidden="true"><i></i></div>
              ${field('confirm', 'Confirmar senha', 'password', 'autocomplete="new-password" maxlength="72"')}
              <button class="btn-next auth-submit" type="submit"><span>Criar minha conta</span></button>
            </form>
            <p class="auth-switch">Já tem conta?
              <button type="button" class="btn-ghost auth-cta" data-switch="login">ENTRAR</button>
            </p>
          </section>

          <!-- Área: CONTA (usuário já logado) -->
          <section class="auth-panel auth-account" data-panel="account" aria-labelledby="t-acc" hidden>
            <div class="auth-avatar" aria-hidden="true"></div>
            <h2 id="t-acc">Olá!</h2>
            <p class="auth-who"></p>
            <p class="auth-saved">✓ Seu progresso está sendo salvo no banco de dados.</p>
            <div class="auth-actions">
              <a class="btn-next" href="/" data-link>Continuar lendo</a>
              <button type="button" class="btn-ghost" data-logout>Sair da conta</button>
            </div>
          </section>
        </div>
      </div>`);
    this.#bind();
  }

  #bind() {
    this.$root.on('click', '[data-switch]', (e) => this.#h.switch?.($(e.currentTarget).data('switch')));
    this.$root.on('click', '[data-logout]', () => this.#h.logout?.());
    this.$root.on('submit', 'form', (e) => {
      e.preventDefault();
      const $f = $(e.currentTarget);
      this.#h.submit?.($f.data('form'), Object.fromEntries(new FormData($f[0])));
    });
    this.$root.on('click', '.auth-eye', (e) => {
      const $b = $(e.currentTarget);
      const $i = $b.siblings('input');
      const show = $i.attr('type') === 'password';
      $i.attr('type', show ? 'text' : 'password');
      $b.attr({ 'aria-pressed': show, 'aria-label': show ? 'Ocultar senha' : 'Mostrar senha' });
    });
    this.$root.on('input', 'input', (e) => {
      const $field = $(e.currentTarget).closest('.auth-field');
      this.#fieldError($field, '');
      if (e.currentTarget.name === 'password' && $(e.currentTarget).closest('form').data('form') === 'register') this.#meter(e.currentTarget.value);
    });
  }

  #meter(v) {
    const score = Math.min(4, [v.length >= 8, v.length >= 12, /[A-Z]/.test(v) && /[a-z]/.test(v), /\d/.test(v) && /[^\w\s]/.test(v)].filter(Boolean).length);
    this.$root.find('.auth-meter').attr('data-score', v ? score : 0).find('i').css('width', `${(v ? score : 0) * 25}%`);
  }

  #fieldError($field, msg) {
    $field.toggleClass('has-error', Boolean(msg)).find('.auth-error').text(msg);
    $field.find('input').attr('aria-invalid', msg ? 'true' : 'false');
  }

  /** Alterna entre as áreas "login" e "register" (com animação). */
  setMode(mode, { focus = false } = {}) {
    this.mode = mode;
    this.$root.find('.auth').attr('data-mode', mode);
    this.$root.find('.auth-panel').each((_, el) => {
      const on = el.dataset.panel === mode;
      $(el).prop('hidden', !on);
      if (on) { el.classList.remove('is-swap'); void el.offsetWidth; el.classList.add('is-swap'); }
    });
    this.clearErrors();
    if (focus) this.$root.find(`[data-panel="${mode}"] input`).first().trigger('focus');
  }

  /** Mostra a área da conta (logado) ou o formulário atual (visitante). */
  setUser(user) {
    const $acc = this.$root.find('[data-panel="account"]');
    this.$root.find('.auth').toggleClass('is-logged', Boolean(user));
    if (!user) { this.setMode(this.mode === 'register' ? 'register' : 'login'); return; }
    this.$root.find('.auth-panel').prop('hidden', true);
    $acc.prop('hidden', false);
    $acc.find('h2').text(`Olá, ${user.name.split(' ')[0]}!`);
    $acc.find('.auth-who').html(`${esc(user.email)}<br><small>Conta ${user.provider === 'google' ? 'Google' : 'do site'}</small>`);
    $acc.find('.auth-avatar').html(user.avatarUrl
      ? `<img src="${esc(user.avatarUrl)}" alt="" referrerpolicy="no-referrer" />`
      : `<span>${esc([...user.name.trim()][0]?.toUpperCase() ?? '?')}</span>`);
  }

  clearErrors() {
    this.$root.find('.auth-field').each((_, f) => this.#fieldError($(f), ''));
    this.$root.find('.auth-alert').prop('hidden', true).text('');
  }

  fieldError(form, name, msg) {
    const $f = this.$root.find(`form[data-form="${form}"] [data-field="${name}"]`);
    this.#fieldError($f, msg);
    $f.find('input').trigger('focus');
  }

  formError(form, msg) {
    this.$root.find(`form[data-form="${form}"] .auth-alert`).text(msg).prop('hidden', false);
  }

  busy(form, on) {
    const $f = this.$root.find(`form[data-form="${form}"]`);
    $f.find('.auth-submit').prop('disabled', on).toggleClass('is-busy', on).attr('aria-busy', on);
    $f.find('input').prop('readonly', on);
  }

  resetForms() {
    this.$root.find('form').each((_, f) => f.reset());
    this.#meter('');
  }

  /** Botão do Google (Google Identity Services). Sem configuração, mostra o botão desativado. */
  renderGoogle(gsiReady) {
    this.$root.find('.auth-google').each((_, el) => {
      if (gsiReady) { gsiReady(el, el.dataset.google); return; }
      $(el).html(`<button type="button" class="auth-google-off" disabled title="Defina GOOGLE_CLIENT_ID no .env do servidor">${GOOGLE}<span>Continuar com o Google</span></button><small class="auth-hint">Login com Google indisponível neste servidor.</small>`);
    });
  }
}
