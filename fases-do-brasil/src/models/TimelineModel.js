import { bus } from '@/infra/EventBus.js';

/**
 * Model (MVC): estado observável da linha do tempo.
 * Emite eventos no EventBus sempre que o estado muda (Observer).
 */
export class TimelineModel {
  phases = [];
  periods = [];
  activeIndex = 0; // fase em destaque (hover/foco/atual) — alimenta a cena 3D
  openIndex = null;

  constructor(progress) {
    this.progress = progress;
  }

  hydrate({ phases, periods }) {
    this.phases = phases;
    this.periods = periods;
    this.progress.load(phases);
    this.activeIndex = this.progress.focusIndex;
    bus.emit('timeline:loaded', this);
  }

  get opened() { return this.openIndex === null ? null : this.phases[this.openIndex]; }

  periodOf(phase) { return this.periods.find((p) => p.id === phase.period); }

  indexOf(id) { return this.phases.findIndex((p) => p.id === id); }

  setActive(index) {
    const i = Math.max(0, Math.min(this.phases.length - 1, index));
    if (i === this.activeIndex) return;
    this.activeIndex = i;
    bus.emit('timeline:active', { index: i, phase: this.phases[i] });
  }

  open(index, originRect = null) {
    const i = Math.max(0, Math.min(this.phases.length - 1, index));
    this.openIndex = i;
    this.activeIndex = i;
    bus.emit('phase:open', { index: i, phase: this.phases[i], originRect });
  }

  close() {
    if (this.openIndex === null) return;
    const index = this.openIndex;
    this.openIndex = null;
    bus.emit('phase:close', { index, phase: this.phases[index] });
  }
}
