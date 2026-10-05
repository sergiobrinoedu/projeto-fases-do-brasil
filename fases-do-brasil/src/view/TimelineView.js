import $ from 'jquery';
import { createPhaseCard } from '@/components/PhaseCard.js';
import { esc } from '@/infra/escape.js';

const STATUS = { read: '✓ Lida', current: 'Você está aqui', todo: '' };

/**
 * View: linha do tempo contínua — 3 fases por linha (2 em tablet, 1 em celular);
 * a linha dourada percorre cada fileira e DESCE para a seguinte.
 */
export class TimelineView {
  #h = { select() {}, hover() {}, reset() {} };
  #io = null;
  #bound = false;
  #lastCols = 0;

  constructor(root) {
    this.$root = $(root);
    this.$grid = this.$root.find('.tl-grid');
    this.model = null;
    this.progress = null;
    const rerender = () => this.model && this.cols !== this.#lastCols && this.render(this.model, this.progress);
    [matchMedia('(max-width: 991px)'), matchMedia('(max-width: 575px)')].forEach((mq) => mq.addEventListener('change', rerender));
  }

  get cols() {
    return Number(getComputedStyle(this.$grid[0]).getPropertyValue('--cols')) || 3;
  }

  onSelect(cb) { this.#h.select = cb; }
  onHover(cb) { this.#h.hover = cb; }
  onReset(cb) { this.#h.reset = cb; }

  render(model, progress) {
    this.model = model;
    this.progress = progress;
    const cols = (this.#lastCols = this.cols);
    this.$grid.empty();
    this.#io?.disconnect();

    let lastPeriod = null;
    for (let start = 0; start < model.phases.length; start += cols) {
      const $row = $('<div class="tl-row"></div>');
      model.phases.slice(start, start + cols).forEach((phase, k) => {
        const i = start + k;
        const period = model.periodOf(phase);
        const first = period.id !== lastPeriod;
        lastPeriod = period.id;
        const $item = $(`<div class="tl-item" role="listitem" data-index="${i}" data-period="${esc(phase.period)}"></div>`);
        $item.append(`<div class="tl-year" aria-hidden="true">${esc(phase.startYear)}${first ? `<small>${esc(period.name)}</small>` : ''}</div>`);
        $item.append('<div class="tl-node" aria-hidden="true"><span class="tl-dot"></span></div>');
        $item.append(createPhaseCard(phase, i, period));
        $row.append($item);
      });
      this.$grid.append($row);
    }

    this.#observe();
    this.updateStates(progress);
    this.renderProgress(progress);
    this.#bind();
  }

  #observe() {
    const items = this.$grid.find('.tl-item').toArray();
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    this.#io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); this.#io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach((el, k) => { el.style.setProperty('--d', `${(k % this.cols) * 90}ms`); this.#io.observe(el); });
  }

  #bind() {
    if (this.#bound) return;
    this.#bound = true;
    this.$grid.on('click', '.phase-card', (e) => {
      const $c = $(e.currentTarget);
      this.#h.select(Number($c.data('index')), $c[0].getBoundingClientRect());
    });
    this.$grid.on('mouseover focusin', '.phase-card', (e) => this.#h.hover(Number($(e.currentTarget).data('index'))));
    this.$root.on('click', '.journey__reset', () => this.#h.reset());
  }

  /** Atualiza marcação lida / atual / pendente de cada card. */
  updateStates(progress) {
    this.progress = progress;
    this.$grid.find('.tl-item').each((_, el) => {
      const i = Number(el.dataset.index);
      const state = progress.stateOf(i);
      const phase = this.model.phases[i];
      el.dataset.state = state;
      $(el).find('.phase-card__status').text(STATUS[state]);
      $(el).find('.phase-card').attr('aria-label',
        `Abrir fase: ${phase.title}, ${phase.yearsLabel}${state === 'read' ? ' (já lida)' : state === 'current' ? ' (fase atual)' : ''}`);
    });
  }

  renderProgress(progress) {
    const { readCount, total, finished } = progress;
    this.$root.find('.journey__text').text(finished
      ? 'Parabéns! Você concluiu todas as fases.'
      : readCount === 0 ? 'Comece pela primeira fase e avance no seu ritmo.' : `Você leu ${readCount} de ${total} fases.`);
    this.$root.find('.journey__bar i').css('width', `${(readCount / total) * 100}%`);
    this.$root.find('.journey__reset').prop('hidden', readCount === 0);
  }

  cardEl(i) { return this.$grid.find(`.tl-item[data-index="${i}"]`)[0]; }

  scrollToIndex(i, behavior = 'smooth') {
    this.cardEl(i)?.scrollIntoView({ behavior, block: 'center' });
  }

  /** Destaque de chegada (após concluir uma fase). */
  pulse(i) {
    const el = this.cardEl(i);
    if (!el) return;
    el.classList.remove('is-arriving');
    void el.offsetWidth;
    el.classList.add('is-arriving');
    setTimeout(() => el.classList.remove('is-arriving'), 2200);
  }

  focusCard(i) {
    this.cardEl(i)?.querySelector('.phase-card')?.focus({ preventScroll: true });
  }

  cardRect(i) {
    return this.cardEl(i)?.querySelector('.phase-card')?.getBoundingClientRect() ?? null;
  }
}
