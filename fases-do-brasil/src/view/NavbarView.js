import $ from 'jquery';

const ITEMS = [
  { page: 'home', href: '/', label: 'Início' },
  { page: 'sobre', href: '/sobre', label: 'Sobre' },
  { page: 'equipe', href: '/equipe', label: 'Sobre nós' },
];

/** View: navbar horizontal em "vidro" (glassmorphism) estilo vitrine. Links são rotas. */
export class NavbarView {
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
      </nav>`);
  }

  setActive(page) {
    this.$root.find('.glass-nav__list a').removeClass('is-active').removeAttr('aria-current');
    this.$root.find(`.glass-nav__list a[data-page="${page}"]`).addClass('is-active').attr('aria-current', 'page');
  }

  setScrolled(on) {
    this.$root.toggleClass('is-scrolled', on);
  }
}
