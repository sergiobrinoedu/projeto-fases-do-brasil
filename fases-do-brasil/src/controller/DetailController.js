import { bus } from '@/infra/EventBus.js';

/**
 * Controller: abre/fecha/navega o detalhe da fase e mantém a URL (/fase/:id).
 * "Próxima fase": marca a atual como lida, volta (zoom out) à linha do tempo
 * e leva o aluno ao card seguinte.
 */
export class DetailController {
  #nextAfterClose = null;

  constructor({ model, detailView, timelineView, router }) {
    this.model = model;
    this.detail = detailView;
    this.timeline = timelineView;
    this.router = router;
  }

  init() {
    this.detail.onClose(() => this.model.close());
    this.detail.onPrev(() => this.#goTo(this.model.openIndex - 1));
    this.detail.onComplete(() => this.#complete());

    bus.on('phase:open', (e) => {
      const wasOpen = this.detail.isOpen;
      if (!e.originRect && !wasOpen) this.timeline.scrollToIndex(e.index, 'instant'); // vindo de link/URL
      const payload = this.#payload(e.index);
      if (wasOpen) this.detail.swap(payload);
      else this.detail.open({ ...payload, originRect: e.originRect ?? this.timeline.cardRect(e.index) });
      this.router.sync(`/fase/${e.phase.id}`, { replace: wasOpen });
    });

    bus.on('phase:close', async ({ index }) => {
      if (location.pathname.startsWith('/fase/')) this.router.sync('/');
      const next = this.#nextAfterClose;
      this.#nextAfterClose = null;
      const target = next ?? index;
      this.timeline.scrollToIndex(target, 'instant'); // posiciona por trás do overlay
      await this.detail.close(this.timeline.cardRect(target));
      this.timeline.focusCard(target);
      if (next !== null) this.timeline.pulse(next);
    });

    document.addEventListener('keydown', (e) => {
      if (!this.model.opened) return;
      if (e.key === 'Escape') { e.preventDefault(); this.model.close(); }
      else if (e.key === 'ArrowLeft') this.#goTo(this.model.openIndex - 1);
      else if (e.key === 'ArrowRight') this.#complete();
    });
  }

  openById(id) {
    const index = this.model.indexOf(id);
    if (index < 0) return false;
    if (this.model.openIndex !== index) this.model.open(index, null);
    return true;
  }

  #goTo(index) {
    if (index < 0 || index >= this.model.phases.length) return;
    this.model.open(index, null);
  }

  #complete() {
    const index = this.model.openIndex;
    if (index === null) return;
    this.model.progress.complete(index);
    this.#nextAfterClose = index + 1 < this.model.phases.length ? index + 1 : null;
    this.model.close();
  }

  #payload(index) {
    const phase = this.model.phases[index];
    return { phase, period: this.model.periodOf(phase), index, total: this.model.phases.length };
  }
}
