import $ from 'jquery';
import { bus } from '@/infra/EventBus.js';

const PAGES = {
  home: { sel: '#page-home', title: 'Fases do Brasil — Linha do Tempo' },
  sobre: { sel: '#page-sobre', title: 'Sobre o projeto — Fases do Brasil' },
  login: { sel: '#page-login', title: 'Entrar — Fases do Brasil' },
  equipe: { sel: '#page-equipe', title: 'Sobre nós — Fases do Brasil' },
};

/** View: alterna entre as páginas (views) do site conforme a rota. */
export class PageManager {
  current = null;

  show(name, { resetScroll = true } = {}) {
    if (!PAGES[name]) name = 'home';
    if (this.current === name) return;
    Object.entries(PAGES).forEach(([key, p]) => $(p.sel).prop('hidden', key !== name));
    $(PAGES[name].sel).removeClass('is-entering');
    void $(PAGES[name].sel)[0].offsetWidth;
    $(PAGES[name].sel).addClass('is-entering');
    document.title = PAGES[name].title;
    document.body.dataset.page = name;
    if (resetScroll) window.scrollTo({ top: 0, behavior: 'instant' });
    this.current = name;
    bus.emit('page:changed', { name });
  }
}
