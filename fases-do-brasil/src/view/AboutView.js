import $ from 'jquery';
import { createPeriodCard } from '@/components/PeriodCard.js';
import { esc } from '@/infra/escape.js';

/** View (página /sobre): contexto do projeto, como usar e os três grandes períodos. */
export class AboutView {
  constructor(root) {
    this.$root = $(root);
  }

  render({ periods, site }) {
    const { about } = site;
    this.$root.html(`
      <header class="page-head">
        <span class="eyebrow">Contexto</span>
        <h1>${esc(about.title)}</h1>
        ${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
      </header>

      <h2 class="page-sub">Como navegar</h2>
      <ol class="howto">
        ${about.howto.map((h, i) => `<li><span class="howto__n">${i + 1}</span><strong>${esc(h.title)}</strong><p>${esc(h.text)}</p></li>`).join('')}
      </ol>

      <h2 class="page-sub">Os três grandes períodos</h2>
      <div class="period-grid"></div>

      <p class="page-cta"><a class="btn-next" href="/" data-link>Começar a jornada →</a></p>`);
    const $grid = this.$root.find('.period-grid');
    periods.forEach((p) => $grid.append(createPeriodCard(p)));
  }
}
