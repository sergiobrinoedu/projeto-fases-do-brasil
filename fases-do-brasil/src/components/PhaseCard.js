import $ from 'jquery';
import { art } from '@/services/ArtService.js';
import { esc } from '@/infra/escape.js';

const MAX_TILT = 11; // graus

/**
 * Factory de componente: card de uma fase.
 * Hover = ZOOM IN + efeito 3D "saltando da tela" (elevação em Z, inclinação
 * que segue o mouse, brilho e sombra no chão). Ao sair, volta ao normal.
 */
export function createPhaseCard(phase, index, period) {
  const $card = $(`
    <button type="button" class="phase-card" data-index="${index}" data-period="${esc(phase.period)}">
      <span class="phase-card__shadow" aria-hidden="true"></span>
      <span class="phase-card__face">
        <span class="phase-card__img">
          <img src="${art.cover(phase)}" alt="" width="800" height="500" draggable="false" loading="lazy">
        </span>
        <span class="phase-card__body">
          <span class="phase-card__years">${esc(phase.yearsLabel)}</span>
          <strong class="phase-card__title">${esc(phase.title)}</strong>
          <span class="phase-card__sub">${esc(phase.subtitle)}</span>
        </span>
        <span class="phase-card__cta" aria-hidden="true">Explorar fase <i>→</i></span>
      </span>
      <span class="phase-card__badge" aria-hidden="true">${esc(period?.name ?? '')}</span>
      <span class="phase-card__status" aria-hidden="true"></span>
    </button>`);

  return attachTilt($card);
}

/** Efeito 3D que segue o mouse (compartilhado por todos os tipos de card). */
export function attachTilt($card) {
  const el = $card[0];
  $card.on('pointermove', (e) => {
    if (e.originalEvent.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${((px - 0.5) * MAX_TILT).toFixed(2)}deg`);
    el.style.setProperty('--rx', `${(-(py - 0.5) * MAX_TILT).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
  });
  $card.on('pointerleave blur', () => {
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  });

  return $card;
}

/** Card de um grande período (nível "Períodos" da linha do tempo). Clicar dá zoom no período. */
export function createPeriodNodeCard(period, coverPhase, count) {
  const $card = $(`
    <button type="button" class="phase-card phase-card--period" data-period="${esc(period.id)}" aria-label="Dar zoom em ${esc(period.name)}">
      <span class="phase-card__shadow" aria-hidden="true"></span>
      <span class="phase-card__face">
        <span class="phase-card__img"><img src="${art.cover(coverPhase)}" alt="" width="800" height="500" draggable="false" loading="lazy"></span>
        <span class="phase-card__body">
          <span class="phase-card__years">${esc(period.yearsLabel)}</span>
          <strong class="phase-card__title">${esc(period.name)}</strong>
          <span class="phase-card__sub">${count} fases históricas</span>
        </span>
        <span class="phase-card__cta" aria-hidden="true">Dar zoom <i>＋</i></span>
      </span>
      <span class="phase-card__badge" aria-hidden="true">Período</span>
    </button>`);
  return attachTilt($card);
}

/** Card pequeno de um marco (nível "Marcos"): destaque de uma fase. Clicar abre a fase. */
export function createMarkCard(text, phase, index) {
  const $card = $(`
    <button type="button" class="phase-card phase-card--mark" data-phase-index="${index}" data-period="${esc(phase.period)}" aria-label="${esc(text)} — abrir a fase ${esc(phase.title)}">
      <span class="phase-card__shadow" aria-hidden="true"></span>
      <span class="phase-card__face">
        <span class="phase-card__img"><img src="${art.cover(phase)}" alt="" width="800" height="500" draggable="false" loading="lazy"></span>
        <span class="phase-card__body"><strong class="phase-card__title">${esc(text)}</strong></span>
      </span>
    </button>`);
  return attachTilt($card);
}
