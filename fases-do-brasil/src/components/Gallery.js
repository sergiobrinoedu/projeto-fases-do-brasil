import $ from 'jquery';
import { Carousel } from 'bootstrap';
import { esc } from '@/infra/escape.js';

let uid = 0;

/** Componente: galeria de imagens baseada no Carousel do Bootstrap. */
export class Gallery {
  constructor(images, label) {
    this.id = `gallery-${++uid}`;
    this.$el = $(`
      <div id="${this.id}" class="carousel slide gallery" data-bs-touch="true" aria-roledescription="carrossel" aria-label="Imagens: ${esc(label)}">
        <div class="carousel-indicators">
          ${images.map((_, i) => `<button type="button" data-bs-target="#${this.id}" data-bs-slide-to="${i}" ${i === 0 ? 'class="active" aria-current="true"' : ''} aria-label="Imagem ${i + 1}"></button>`).join('')}
        </div>
        <div class="carousel-inner">
          ${images.map((src, i) => `<div class="carousel-item ${i === 0 ? 'active' : ''}"><img src="${esc(src)}" class="d-block w-100" alt="${esc(label)} — imagem ${i + 1} de ${images.length}" draggable="false"></div>`).join('')}
        </div>
        ${images.length > 1 ? `
        <button class="carousel-control-prev" type="button" data-bs-target="#${this.id}" data-bs-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Anterior</span></button>
        <button class="carousel-control-next" type="button" data-bs-target="#${this.id}" data-bs-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Próxima</span></button>` : ''}
      </div>`);
  }

  mount($parent) {
    $parent.empty().append(this.$el);
    this.carousel = new Carousel(this.$el[0], { interval: 5500, ride: false, touch: true, pause: 'hover' });
    this.carousel.cycle();
    return this;
  }

  destroy() {
    this.carousel?.dispose();
    this.$el.remove();
  }
}
