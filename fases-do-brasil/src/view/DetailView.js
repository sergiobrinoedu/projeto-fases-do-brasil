import $ from 'jquery';
import { Gallery } from '@/components/Gallery.js';
import { art } from '@/services/ArtService.js';
import { esc } from '@/infra/escape.js';

const ANIM_MS = 760;

/**
 * View: tela de detalhe da fase. Abre com ZOOM IN a partir do card clicado
 * (clip-path animado + escala do conteúdo) e fecha com o efeito inverso.
 */
export class DetailView {
  #gallery = null;
  #closing = false;
  #h = { close() {}, prev() {}, complete() {} };

  constructor(root) {
    this.$root = $(root);
    this.$root.html(`
      <div class="detail__panel">
        <div class="detail__inner">
          <header class="detail__bar">
            <button type="button" class="detail__close"><span aria-hidden="true">←</span> Voltar à linha do tempo</button>
            <div class="detail__step">
              <button type="button" class="detail__prev btn-ghost" aria-label="Fase anterior">‹ Anterior</button>
              <span class="detail__count" aria-live="polite"></span>
              <button type="button" class="detail__next btn-next"></button>
            </div>
          </header>
          <div class="detail__grid">
            <div class="detail__media"></div>
            <article class="detail__text"></article>
          </div>
        </div>
      </div>`);
    this.$panel = this.$root.find('.detail__panel');
    this.$text = this.$root.find('.detail__text');
    this.$media = this.$root.find('.detail__media');

    this.$root.on('click', '.detail__close', () => this.#h.close());
    this.$root.on('click', '.detail__prev', () => this.#h.prev());
    this.$root.on('click', '.detail__next, .detail__finish', () => this.#h.complete());
  }

  onClose(cb) { this.#h.close = cb; }
  onPrev(cb) { this.#h.prev = cb; }
  onComplete(cb) { this.#h.complete = cb; }
  get isOpen() { return !this.$root.prop('hidden'); }

  #inset(rect) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const r = rect ?? { top: h / 2 - 60, left: w / 2 - 90, right: w / 2 + 90, bottom: h / 2 + 60 };
    const clamp = (v) => Math.max(0, v);
    return `inset(${clamp(r.top)}px ${clamp(w - r.right)}px ${clamp(h - r.bottom)}px ${clamp(r.left)}px round 18px)`;
  }

  #fill({ phase, period, index, total }) {
    const last = index >= total - 1;
    const nextLabel = last ? 'Concluir jornada ✓' : 'Próxima fase →';
    this.#gallery?.destroy();
    this.#gallery = new Gallery(art.imagesFor(phase, 3), phase.title).mount(this.$media);
    this.$text.attr('data-period', phase.period).html(`
      <span class="chip">${esc(period?.name ?? '')}</span>
      <h2 id="detail-title">${esc(phase.title)}</h2>
      <p class="detail__years">${esc(phase.yearsLabel)}</p>
      <p class="detail__subtitle">${esc(phase.subtitle)}</p>
      ${phase.description.map((p) => `<p>${esc(p)}</p>`).join('')}
      <h3>Em destaque</h3>
      <ul class="highlights">${phase.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
      <div class="detail__finish-wrap">
        <p>Terminou a leitura? Marque esta fase como lida e volte à linha do tempo${last ? '.' : ' para seguir à próxima.'}</p>
        <button type="button" class="detail__finish btn-next">${nextLabel}</button>
      </div>`);
    this.$root.find('.detail__count').text(`${index + 1} / ${total}`);
    this.$root.find('.detail__prev').prop('disabled', index <= 0);
    this.$root.find('.detail__next').text(nextLabel);
    this.$root.attr({ role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'detail-title' });
    this.$root.find('.detail__inner')[0].scrollTop = 0;
  }

  open({ originRect, ...data }) {
    this.#closing = false;
    this.#fill(data);
    const panel = this.$panel[0];
    this.$root.prop('hidden', false).removeClass('is-open');
    $('body').addClass('is-detail-open');
    panel.style.transition = 'none';
    panel.style.clipPath = this.#inset(originRect);
    void panel.offsetWidth; // força reflow
    panel.style.transition = '';
    requestAnimationFrame(() => {
      this.$root.addClass('is-open');
      panel.style.clipPath = 'inset(0px 0px 0px 0px round 0px)';
    });
    setTimeout(() => this.$root.find('.detail__close').trigger('focus'), ANIM_MS);
  }

  /** Troca de fase sem refazer a animação de zoom (apenas cross-fade). */
  swap(data) {
    const $inner = this.$root.find('.detail__inner');
    $inner.addClass('is-swapping');
    setTimeout(() => {
      this.#fill(data);
      $inner.removeClass('is-swapping');
    }, 220);
  }

  close(targetRect) {
    if (this.#closing || !this.isOpen) return Promise.resolve();
    this.#closing = true;
    const panel = this.$panel[0];
    this.$root.removeClass('is-open');
    panel.style.clipPath = this.#inset(targetRect);
    return new Promise((resolve) => {
      setTimeout(() => {
        this.$root.prop('hidden', true);
        $('body').removeClass('is-detail-open');
        this.#gallery?.destroy();
        this.#gallery = null;
        this.#closing = false;
        resolve();
      }, ANIM_MS);
    });
  }
}
