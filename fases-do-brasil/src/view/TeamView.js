import $ from 'jquery';
import { esc } from '@/infra/escape.js';

/** View (página /equipe): quem somos. */
export class TeamView {
  constructor(root) {
    this.$root = $(root);
  }

  render({ site }) {
    const { team } = site;
    this.$root.html(`
      <header class="page-head">
        <span class="eyebrow">Equipe</span>
        <h1>${esc(team.title)}</h1>
        <p>${esc(team.text)}</p>
      </header>
      <div class="team-grid">
        ${team.members.map((m) => `
          <article class="member">
            <span class="member__avatar" aria-hidden="true">${esc(m.name.trim().charAt(0).toUpperCase())}</span>
            <h3>${esc(m.name)}</h3>
            <p>${esc(m.role)}</p>
          </article>`).join('')}
      </div>
      <p class="page-cta">
        <a class="btn-ghost" href="/sobre" data-link>Sobre o projeto</a>
        <a class="btn-next" href="/" data-link>Ver a linha do tempo →</a>
      </p>`);
  }
}
