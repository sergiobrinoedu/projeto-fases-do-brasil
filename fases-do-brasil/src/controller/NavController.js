import { bus } from '@/infra/EventBus.js';

/** Controller: navbar — destaca o item da rota atual e muda o visual ao rolar. */
export class NavController {
  constructor(view) {
    this.view = view;
  }

  init(user = null) {
    this.view.render();
    if (user) this.view.renderUser(user);
    bus.on('page:changed', ({ name }) => this.view.setActive(name));
    bus.on('auth:changed', ({ user }) => this.view.renderUser(user));
    this.view.onLogout(() => bus.emit('auth:logout-request'));
    const onScroll = () => this.view.setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}
