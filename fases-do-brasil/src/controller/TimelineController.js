import { bus } from '@/infra/EventBus.js';
import { ResetButton } from '@/components/ResetButton.js';
import { mirrorProgressToCookie } from '@/services/ProgressCookie.js';

/** Controller: liga Model/Progress à TimelineView (entrada do usuário → modelo → visual). */
export class TimelineController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  init() {
    const { progress } = this.model;
    this.view.onSelect((index, rect) => this.model.open(index, rect));
    this.view.onHover((index) => this.model.setActive(index));
    this.view.onReset(() => progress.reset());

    // botão fixo "Reiniciar" (canto superior esquerdo) + cookie de reserva do progresso
    const fab = new ResetButton();
    fab.onReset(() => progress.reset());
    bus.on('timeline:loaded', () => fab.update(progress));
    bus.on('progress:changed', () => fab.update(progress));
    bus.on('phase:open', () => fab.setHidden(true));
    bus.on('phase:close', () => fab.setHidden(false));
    mirrorProgressToCookie(progress);

    bus.on('timeline:loaded', () => this.view.render(this.model, progress));
    bus.on('progress:changed', () => {
      this.view.updateStates(progress);
      this.view.renderProgress(progress);
      this.model.setActive(progress.focusIndex);
    });

    // navegação por teclado / controle remoto de TV:
    // ← → fase anterior/próxima · ↑ ↓ (ou + −) zoom in/out · Home = visão geral
    document.addEventListener('keydown', (e) => {
      if (this.model.opened || e.altKey || e.ctrlKey || e.metaKey) return;
      if (document.getElementById('page-home')?.hidden) return;
      if (/^(input|textarea|select)$/i.test(e.target.tagName)) return;
      const k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowLeft') this.view.step(k === 'ArrowRight' ? 1 : -1);
      else if (k === 'ArrowUp' || k === '+' || k === '=') this.view.zoomBy(0.22);
      else if (k === 'ArrowDown' || k === '-' || k === '_') this.view.zoomBy(-0.22);
      else if (k === 'Home') this.view.zoomAt(0);
      else return;
      e.preventDefault();
    });
  }
}
