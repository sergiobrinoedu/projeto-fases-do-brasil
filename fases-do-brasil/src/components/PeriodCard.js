import $ from 'jquery';
import { esc } from '@/infra/escape.js';

/** Componente: card de grande período (Colônia / Império / República). */
export function createPeriodCard(period) {
  return $(`
    <article class="period-card" data-period="${esc(period.id)}">
      <span class="period-card__years">${esc(period.yearsLabel)}</span>
      <h3>${esc(period.name)}</h3>
      <p>${esc(period.description)}</p>
      <ul>${period.phases.map((p) => `<li><a href="/fase/${esc(p.id)}" data-link>${esc(p.title)}</a></li>`).join('')}</ul>
    </article>`);
}
