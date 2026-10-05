import { bus } from '@/infra/EventBus.js';

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

    bus.on('timeline:loaded', () => this.view.render(this.model, progress));
    bus.on('progress:changed', () => {
      this.view.updateStates(progress);
      this.view.renderProgress(progress);
      this.model.setActive(progress.focusIndex);
    });

    // navegação por teclado / controle remoto de TV (grade 2D)
    document.addEventListener('keydown', (e) => {
      if (this.model.opened || e.altKey || e.ctrlKey || e.metaKey) return;
      if (document.getElementById('page-home')?.hidden) return;
      if (/^(input|textarea|select)$/i.test(e.target.tagName)) return;
      const cols = this.view.cols;
      const moves = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols };
      if (!(e.key in moves)) return;
      const from = Number(e.target.closest?.('.tl-item')?.dataset.index ?? progress.focusIndex);
      const next = Math.max(0, Math.min(this.model.phases.length - 1, from + moves[e.key]));
      e.preventDefault();
      this.view.scrollToIndex(next);
      this.view.focusCard(next);
    });
  }
}
