import $ from 'jquery';
import { art } from '@/services/ArtService.js';

/**
 * View: "balões" de fundo. Uma imagem de fase por vez surge numa posição
 * aleatória com ZOOM IN, respira (zoom out) e some — nunca todas ao mesmo tempo.
 */
export class BubblesView {
  #timer = 0;
  #recent = [];

  constructor(root) {
    this.$root = $(root);
    this.pool = [];
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  start(phases) {
    if (this.reduced || !phases.length) return;
    this.pool = phases.flatMap((p) => [0, 2].map((v) => art.render(p, v)));
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => this.#tick(), 700);
  }

  #tick() {
    const mobile = window.innerWidth < 700;
    const max = mobile ? 2 : 4;
    if (!document.hidden && this.$root.children().length < max) this.#spawn(mobile);
    this.#timer = setTimeout(() => this.#tick(), 1800 + Math.random() * 1800);
  }

  #pick() {
    const options = this.pool.filter((s) => !this.#recent.includes(s));
    const src = options[Math.floor(Math.random() * options.length)] ?? this.pool[0];
    this.#recent.push(src);
    if (this.#recent.length > Math.min(6, this.pool.length - 1)) this.#recent.shift();
    return src;
  }

  #spawn(mobile) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const size = (mobile ? 6 : 8.5) + Math.random() * (mobile ? 3.5 : 6); // rem
    const px = size * parseFloat(getComputedStyle(document.documentElement).fontSize);
    const left = Math.random() * Math.max(10, vw - px);
    const top = Math.random() * Math.max(10, vh - px);
    const dur = 7 + Math.random() * 3.5;
    const drift = (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 26);

    const $b = $('<div class="bubble" aria-hidden="true"><img alt="" draggable="false"></div>');
    $b.find('img').attr('src', this.#pick());
    $b.css({ left, top, width: `${size}rem`, height: `${size}rem`, '--dur': `${dur}s`, '--drift': `${drift}px` });
    $b.one('animationend', () => $b.remove());
    this.$root.append($b);
  }
}
