import $ from 'jquery';
import { esc } from '@/infra/escape.js';

const ITEMS = [
  { page: 'home', href: '/', label: 'Início' },
  { page: 'sobre', href: '/sobre', label: 'Sobre' },
  { page: 'equipe', href: '/equipe', label: 'Sobre nós' },
];

const USER_ICON = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

/** View: navbar horizontal em "vidro" (glassmorphism) estilo vitrine. Links são rotas. */
export class NavbarView {
  #onLogout = () => {};

  constructor(root) {
    this.$root = $(root);
  }

  render() {
    this.$root.html(`
      <nav class="glass-nav" aria-label="Navegação principal">
        <a class="glass-nav__brand" href="/" data-link aria-label="Fases do Brasil — início">
          <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 4 L19 16 L16 28 L13 16Z" fill="currentColor"/><path d="M4 16 L16 13 L28 16 L16 19Z" fill="currentColor" opacity=".55"/></svg>
          <span>Fases do Brasil</span>
        </a>
        <ul class="glass-nav__list">
          ${ITEMS.map((i) => `<li><a href="${i.href}" data-link data-page="${i.page}">${i.label}</a></li>`).join('')}
        </ul>
        <div class="glass-nav__user"></div>
      </nav>`);
    this.renderUser(null);
    this.#bind();
  }

  /** Ícone de usuário: visitante → leva ao /login; logado → avatar com menu (conta / sair). */
  renderUser(user) {
    const $slot = this.$root.find('.glass-nav__user');
    this.closeMenu();
    if (!user) {
      $slot.html(`<a class="user-btn" href="/login" data-link data-page="login" aria-label="Entrar ou cadastrar-se" title="Entrar">${USER_ICON}</a>`);
      return;
    }
    const initial = esc([...user.name.trim()][0]?.toUpperCase() ?? '?');
    const avatar = user.avatarUrl
      ? `<img src="${esc(user.avatarUrl)}" alt="" referrerpolicy="no-referrer" />`
      : `<span aria-hidden="true">${initial}</span>`;
    $slot.html(`
      <button type="button" class="user-btn user-btn--on" aria-haspopup="menu" aria-expanded="false" aria-controls="user-menu" aria-label="Menu da conta de ${esc(user.name)}">${avatar}</button>
      <div id="user-menu" class="user-menu" role="menu" hidden>
        <div class="user-menu__who"><strong>${esc(user.name)}</strong><small>${esc(user.email)}</small></div>
        <a role="menuitem" href="/login" data-link>Minha conta</a>
        <button type="button" role="menuitem" data-logout>Sair</button>
      </div>`);
  }

  onLogout(cb) { this.#onLogout = cb; }

  closeMenu() {
    this.$root.find('.user-btn--on').attr('aria-expanded', 'false');
    this.$root.find('.user-menu').prop('hidden', true);
  }

  #bind() {
    this.$root.on('click', '.user-btn--on', (e) => {
      e.stopPropagation();
      const $b = $(e.currentTarget);
      const open = $b.attr('aria-expanded') !== 'true';
      this.closeMenu();
      if (open) { $b.attr('aria-expanded', 'true'); this.$root.find('.user-menu').prop('hidden', false).find('[role=menuitem]').first().trigger('focus'); }
    });
    this.$root.on('click', '[data-logout]', () => { this.closeMenu(); this.#onLogout(); });
    this.$root.on('click', '.user-menu a', () => this.closeMenu());
    $(document).on('click', (e) => { if (!$(e.target).closest('.glass-nav__user').length) this.closeMenu(); });
    $(document).on('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const wasOpen = this.$root.find('.user-btn--on').attr('aria-expanded') === 'true';
      this.closeMenu();
      if (wasOpen) this.$root.find('.user-btn--on').trigger('focus');
    });
  }

  setActive(page) {
    this.$root.find('.glass-nav a[data-page]').removeClass('is-active').removeAttr('aria-current');
    this.$root.find(`.glass-nav a[data-page="${page}"]`).addClass('is-active').attr('aria-current', 'page');
  }

  setScrolled(on) {
    this.$root.toggleClass('is-scrolled', on);
  }
}
