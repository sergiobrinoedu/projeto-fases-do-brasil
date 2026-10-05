import { bus } from '@/infra/EventBus.js';

/** Controller: navbar — destaca o item da rota atual e muda o visual ao rolar. */
export class NavController {
  constructor(view) {
    this.view = view;
  }

  init() {
    this.view.render();
    bus.on('page:changed', ({ name }) => this.view.setActive(name));
    const onScroll = () => this.view.setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}
