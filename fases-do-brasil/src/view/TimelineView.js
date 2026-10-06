import $ from 'jquery';
import { createPhaseCard, createPeriodNodeCard, createMarkCard } from '@/components/PhaseCard.js';
import { esc } from '@/infra/escape.js';
import { bus } from '@/infra/EventBus.js';

const STATUS = { read: '✓ Lida', current: 'Você está aqui', todo: '' };
const LEVELS = ['Períodos', 'Fases', 'Marcos'];
const DEPTH = 260; // px de profundidade (translateZ) do efeito de aproximar/afastar

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (x) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };

/**
 * View: linha do tempo HORIZONTAL com zoom contínuo (estilo Google Maps).
 *  - nível 1 "Períodos"  : Colônia · Império · República
 *  - nível 2 "Fases"     : as 11 fases (cards clicáveis → detalhe)
 *  - nível 3 "Marcos"    : os destaques de cada fase
 * Os cards alternam acima/abaixo da linha. Ao dar zoom, a camada atual "passa à frente"
 * (aumenta e some com transparência suave) e a seguinte vem de longe (zoom in);
 * ao afastar, o contrário (zoom out).
 *
 * Eixo do tempo (τ): cada fase ocupa um "slot" de largura 1 → τ ∈ [0, nFases].
 */
export class TimelineView {
  #h = { select() {}, hover() {}, reset() {} };
  #bound = false;
  #raf = 0;
  #last = 0;
  #suppressClick = false;
  #hintGone = false;

  constructor(root) {
    this.$root = $(root);
    this.$stage = this.$root.find('.tl-stage');
    this.stage = this.$stage[0];
    this.model = null;
    this.progress = null;
    this.nodes = [];
    this.layers = {};
    this.z = 0; this.zNow = 0;      // zoom alvo / atual (0..1)
    this.cx = 0; this.cxNow = 0;    // centro alvo / atual (em τ)
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.level = 0;
    new ResizeObserver(() => this.#measure()).observe(this.stage);
  }

  onSelect(cb) { this.#h.select = cb; }
  onHover(cb) { this.#h.hover = cb; }
  onReset(cb) { this.#h.reset = cb; }

  // ------------------------------------------------------------------ construção
  render(model, progress) {
    this.model = model;
    this.progress = progress;
    this.n = model.phases.length;
    this.nodes = [];
    this.$stage.empty();

    this.$stage.append(`<div class="tl-probe tl-probe--cw"></div><div class="tl-probe tl-probe--mw"></div>`);
    this.line = $('<div class="tl-line" aria-hidden="true"></div>').appendTo(this.$stage)[0];
    const layerEl = (name, label) => $(`<div class="tl-layer" data-layer="${name}" role="list" aria-label="${label}"></div>`).appendTo(this.$stage)[0];
    this.layers = { period: layerEl('period', 'Períodos'), phase: layerEl('phase', 'Fases'), mark: layerEl('mark', 'Marcos') };

    // --- períodos
    this.spans = [];
    model.periods.forEach((period, pi) => {
      const idx = model.phases.map((p, i) => (p.period === period.id ? i : -1)).filter((i) => i >= 0);
      if (!idx.length) return;
      const start = idx[0];
      const end = idx[idx.length - 1] + 1;
      const $n = this.#node('period', (start + end) / 2, pi, period.yearsLabel, period.name);
      $n.find('.tl-box').prepend(createPeriodNodeCard(period, model.phases[start], idx.length));
      $n.attr('data-period', period.id).data('period-range', [start, end]);
      const $span = $(`<span class="tl-span" data-period="${esc(period.id)}" aria-hidden="true"></span>`).appendTo(this.layers.period);
      this.spans.push({ el: $span[0], start, end });
    });

    // --- fases
    model.phases.forEach((phase, i) => {
      const period = model.periodOf(phase);
      const $n = this.#node('phase', i + 0.5, i, phase.yearsLabel, phase.title);
      $n.addClass('tl-item').attr({ 'data-index': i, 'data-period': phase.period });
      $n.find('.tl-box').prepend(createPhaseCard(phase, i, period));
    });

    // --- marcos (destaques), distribuídos dentro do slot de cada fase
    let m = 0;
    model.phases.forEach((phase, i) => {
      const k = phase.highlights.length;
      phase.highlights.forEach((text, j) => {
        const $n = this.#node('mark', i + (j + 0.5) / k, m++, phase.yearsLabel, phase.title);
        $n.attr({ 'data-phase-index': i, 'data-period': phase.period });
        $n.find('.tl-name').remove();
        $n.find('.tl-box').prepend(createMarkCard(text, phase, i));
      });
    });

    this.#controls();
    this.#bind();
    this.#measure(true);
    this.updateStates(progress);
    this.renderProgress(progress);
  }

  /** Cria o "ponto" da linha: bolinha, haste, data (lado oposto) e caixa do card + nome. */
  #node(layer, tau, order, date, name) {
    const side = order % 2 === 0 ? 'down' : 'up'; // alterna, como no layout (cima / baixo)
    const $n = $(`
      <div class="tl-it tl-it--${layer}" role="listitem" data-side="${side}">
        <span class="tl-dot" aria-hidden="true"></span>
        <span class="tl-stem" aria-hidden="true"></span>
        <span class="tl-date">${esc(date)}</span>
        <div class="tl-box"><span class="tl-name">${esc(name)}</span></div>
      </div>`).appendTo(this.layers[layer]);
    this.nodes.push({ el: $n[0], layer, tau, shown: true });
    return $n;
  }

  #controls() {
    this.$root.find('.tl-controls').remove();
    this.$controls = $(`
      <div class="tl-controls" role="group" aria-label="Zoom da linha do tempo">
        <button type="button" class="tl-zoom" data-zoom="out" aria-label="Afastar (zoom out)">−</button>
        <div class="tl-level" aria-live="polite">
          <span class="tl-level__name"></span>
          <span class="tl-level__dots" aria-hidden="true"><i></i><i></i><i></i></span>
        </div>
        <button type="button" class="tl-zoom" data-zoom="in" aria-label="Aproximar (zoom in)">＋</button>
      </div>
      <p class="tl-hint" aria-hidden="true">Role o mouse ou use a pinça para dar zoom · arraste para navegar</p>`);
    this.$root.find('.timeline').append(this.$controls);
  }

  // ------------------------------------------------------------------ escala / medidas
  #measure(first = false) {
    if (!this.model) return;
    const W = this.stage.clientWidth;
    if (!W) return;
    const cw = this.$stage.find('.tl-probe--cw')[0]?.offsetWidth || 240;
    const mw = this.$stage.find('.tl-probe--mw')[0]?.offsetWidth || 150;
    this.W = W;
    this.pad = cw / 2 + 24;
    // limites de escala (px por slot): períodos / fases / marcos nunca se sobrepõem
    this.Sa = (cw + 24) * 0.575 * 1.1;        // a partir daqui as fases cabem (alternando)
    this.Sb = 2.2 * (mw + 14);                // a partir daqui os marcos cabem
    const fit = (W - 2 * this.pad) / this.n;
    this.S0 = Math.max(40, Math.min(fit, this.Sa * 0.8));
    this.SMAX = this.Sb * 2.4;
    if (first) { this.z = this.zNow = 0; this.cx = this.cxNow = this.n / 2; }
    this.cx = this.#clampCx(this.cx, this.z);
    this.cxNow = this.#clampCx(this.cxNow, this.zNow);
    this.#layout();
  }

  #S(z) { return this.S0 * (this.SMAX / this.S0) ** z; }
  #zOf(S) { return clamp(Math.log(S / this.S0) / Math.log(this.SMAX / this.S0), 0, 1); }
  get #Sphase() { return Math.sqrt(this.Sa * this.Sb) * 0.97; }

  #clampCx(cx, z) {
    const half = (this.W / 2 - this.pad) / this.#S(z);
    return half >= this.n / 2 ? this.n / 2 : clamp(cx, half, this.n - half);
  }

  // ------------------------------------------------------------------ layout por quadro
  #layout() {
    if (!this.nodes.length) return;
    const S = this.#S(this.zNow);
    const { W, Sa, Sb } = this;
    const px = (tau) => W / 2 + (tau - this.cxNow) * S;

    // camadas: "entrada" (vem de longe) e "saída" (passa à frente) → opacidade + profundidade
    const e1 = smooth((S - 0.95 * Sa) / (0.3 * Sa));
    const x1 = smooth((S - 0.85 * Sa) / (0.3 * Sa));
    const e2 = smooth((S - 0.95 * Sb) / (0.3 * Sb));
    const x2 = smooth((S - 0.85 * Sb) / (0.3 * Sb));
    const state = {
      period: { enter: 1, exit: x1 },
      phase: { enter: e1, exit: x2 },
      mark: { enter: e2, exit: 0 },
    };
    Object.entries(this.layers).forEach(([name, el]) => {
      const { enter, exit } = state[name];
      const o = enter * (1 - exit);
      const tz = -(1 - enter) * DEPTH + exit * DEPTH;
      el.style.opacity = o.toFixed(3);
      el.style.transform = Math.abs(tz) < 0.5 ? 'none' : `translateZ(${tz.toFixed(1)}px)`;
      const on = o > 0.02;
      el.style.visibility = on ? 'visible' : 'hidden';
      el.style.pointerEvents = o > 0.55 ? 'auto' : 'none';
      el.inert = !on;
    });

    const active = document.activeElement;
    this.nodes.forEach((n) => {
      const x = px(n.tau);
      const visible = x > -380 && x < W + 380;
      if (visible !== n.shown && !(n.el.contains(active))) { n.shown = visible; n.el.style.display = visible ? '' : 'none'; }
      if (n.shown) n.el.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    });

    this.line.style.left = `${px(0) - this.pad * 0.6}px`;
    this.line.style.width = `${this.n * S + this.pad * 1.2}px`;
    this.spans?.forEach((s) => {
      s.el.style.left = `${px(s.start) + 3}px`;
      s.el.style.width = `${Math.max(0, (s.end - s.start) * S - 6)}px`;
    });

    const zq = Math.round(this.zNow * 200) / 200;
    if (zq !== this.zEmitted) { this.zEmitted = zq; bus.emit('timeline:zoom', { z: zq }); }

    const level = S < 0.95 * Sa ? 0 : S < 0.95 * Sb ? 1 : 2;
    if (level !== this.level || !this.$controls.data('init')) {
      this.level = level;
      this.$controls.data('init', true);
      this.$controls.find('.tl-level__name').text(LEVELS[level]);
      this.$controls.find('.tl-level__dots i').each((i, d) => d.classList.toggle('is-on', i <= level));
      this.stage.dataset.level = ['periodos', 'fases', 'marcos'][level];
    }
    this.$controls.find('[data-zoom=out]').prop('disabled', this.z <= 0.001);
    this.$controls.find('[data-zoom=in]').prop('disabled', this.z >= 0.999);
  }

  #kick() {
    if (this.#raf) return;
    this.#last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - this.#last) / 1000);
      this.#last = now;
      const k = this.reduced ? 1 : 1 - Math.exp(-dt * 11);
      this.zNow += (this.z - this.zNow) * k;
      this.cxNow += (this.cx - this.cxNow) * k;
      const done = Math.abs(this.z - this.zNow) < 0.0004 && Math.abs(this.cx - this.cxNow) < 0.0004;
      if (done) { this.zNow = this.z; this.cxNow = this.cx; }
      this.#layout();
      this.#raf = done ? 0 : requestAnimationFrame(tick);
    };
    this.#raf = requestAnimationFrame(tick);
  }

  // ------------------------------------------------------------------ zoom / pan (API)
  /** Muda o zoom mantendo o ponto τ sob `screenX` fixo (zoom no cursor, como no Google Maps). */
  zoomAt(nz, screenX = this.W / 2) {
    const z = clamp(nz, 0, 1);
    const tauUnder = this.cx + (screenX - this.W / 2) / this.#S(this.z);
    this.z = z;
    this.cx = this.#clampCx(tauUnder - (screenX - this.W / 2) / this.#S(z), z);
    this.#hideHint();
    this.#kick();
  }

  zoomBy(dz) { this.zoomAt(this.z + dz); }

  panBy(dx) {
    this.cx = this.#clampCx(this.cx - dx / this.#S(this.z), this.z);
    this.cxNow = this.cx;
    this.#hideHint();
    this.#layout();
  }

  /** Leva a visão para uma fase (zoom no nível "Fases", centralizada). */
  scrollToIndex(i, behavior = 'smooth') {
    if (!this.model) return;
    const S = this.#Sphase;
    const z = this.#zOf(S);
    const cx = this.#clampCx(i + 0.5, z);
    this.#goto(z, cx, behavior === 'instant');
  }

  #zoomToPeriod([start, end]) {
    const S = this.#Sphase;
    const z = this.#zOf(S);
    const half = (this.W / 2 - this.pad) / S;
    const span = (end - start) / 2;
    // centraliza o período; se não couber, mostra o começo dele
    const cx = this.#clampCx(span <= half ? (start + end) / 2 : start + half, z);
    this.#goto(z, cx, false);
  }

  #goto(z, cx, instant) {
    this.z = z; this.cx = cx;
    this.#hideHint();
    if (instant) { this.zNow = z; this.cxNow = cx; this.#layout(); } else this.#kick();
  }

  /** ← → : próxima/anterior fase (nos níveis com fases) ou desloca a linha (nível "Períodos"). */
  step(dir) {
    if (this.level === 0) { this.panBy(-dir * this.W * 0.35); return; }
    const from = this.#nearestPhase();
    const next = clamp(from + dir, 0, this.n - 1);
    this.scrollToIndex(next);
    this.focusCard(next);
  }

  #nearestPhase() {
    const f = document.activeElement?.closest?.('.tl-item');
    if (f) return Number(f.dataset.index);
    return clamp(Math.round(this.cx - 0.5), 0, this.n - 1);
  }

  // ------------------------------------------------------------------ eventos
  #bind() {
    if (this.#bound) return;
    this.#bound = true;
    const stage = this.stage;
    const localX = (e) => e.clientX - stage.getBoundingClientRect().left;

    // cliques nos cards
    this.$stage.on('click', '.phase-card--period', (e) => {
      const range = $(e.currentTarget).closest('.tl-it').data('period-range');
      this.#zoomToPeriod(range);
    });
    this.$stage.on('click', '.tl-it--phase .phase-card', (e) => {
      const $c = $(e.currentTarget);
      this.#h.select(Number($c.data('index')), $c[0].getBoundingClientRect());
    });
    this.$stage.on('click', '.phase-card--mark', (e) => {
      const $c = $(e.currentTarget);
      this.#h.select(Number($c.data('phase-index')), $c[0].getBoundingClientRect());
    });
    this.$stage.on('mouseover focusin', '.tl-it--phase .phase-card', (e) => this.#h.hover(Number($(e.currentTarget).data('index'))));
    this.$stage.on('mouseover focusin', '.phase-card--mark', (e) => this.#h.hover(Number($(e.currentTarget).data('phase-index'))));
    this.$root.on('click', '.journey__reset', () => this.#h.reset());
    this.$root.on('click', '[data-zoom]', (e) => this.zoomBy(e.currentTarget.dataset.zoom === 'in' ? 0.22 : -0.22));

    // clique logo após arrastar não abre card
    stage.addEventListener('click', (e) => {
      if (this.#suppressClick) { e.stopPropagation(); e.preventDefault(); this.#suppressClick = false; }
    }, true);

    // roda do mouse = zoom no cursor (no limite, deixa a página rolar); Shift/lateral = deslocar
    stage.addEventListener('wheel', (e) => {
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        this.panBy(-(e.deltaX || e.deltaY));
        return;
      }
      const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      const nz = clamp(this.z - d * (e.ctrlKey ? 0.006 : 0.0011), 0, 1);
      if (nz === this.z) return;
      e.preventDefault();
      this.zoomAt(nz, localX(e));
    }, { passive: false });

    // arrastar (mouse/toque) = deslocar; dois dedos = pinça
    const pts = new Map();
    let drag = null;
    let pinch = null;
    stage.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) drag = { x: e.clientX, cx: this.cx, moved: 0, captured: false };
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: this.z };
        drag = null;
      }
    });
    stage.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pts.size === 2) {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const mid = (a.x + b.x) / 2 - stage.getBoundingClientRect().left;
        const nz = clamp(pinch.z + Math.log(d / pinch.d) / Math.log(this.SMAX / this.S0), 0, 1);
        this.zoomAt(nz, mid);
        this.#suppressClick = true;
      } else if (drag) {
        const dx = e.clientX - drag.x;
        drag.moved = Math.max(drag.moved, Math.abs(dx));
        if (drag.moved > 6) {
          if (!drag.captured) { drag.captured = true; try { stage.setPointerCapture(e.pointerId); } catch { /* noop */ } stage.classList.add('is-dragging'); }
          this.cx = this.#clampCx(drag.cx - dx / this.#S(this.z), this.z);
          this.cxNow = this.cx;
          this.#hideHint();
          this.#layout();
        }
      }
    });
    const end = (e) => {
      pts.delete(e.pointerId);
      if (drag?.moved > 6) this.#suppressClick = true;
      if (pts.size < 2) pinch = null;
      if (!pts.size) { drag = null; stage.classList.remove('is-dragging'); setTimeout(() => { this.#suppressClick = false; }, 60); }
    };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);

    // duplo clique no vazio = aproxima naquele ponto
    stage.addEventListener('dblclick', (e) => {
      if (e.target.closest('.phase-card')) return;
      this.zoomAt(this.z + 0.28, localX(e));
    });
  }

  #hideHint() {
    if (this.#hintGone) return;
    this.#hintGone = true;
    this.$root.find('.tl-hint').addClass('is-gone');
  }

  // ------------------------------------------------------------------ progresso (inalterado para os controllers)
  /** Atualiza marcação lida / atual / pendente de cada card. */
  updateStates(progress) {
    this.progress = progress;
    const set = (el, i) => {
      const state = progress.stateOf(i);
      el.dataset.state = state;
      return state;
    };
    $(this.layers.phase).find('.tl-it').each((_, el) => {
      const i = Number(el.dataset.index);
      const phase = this.model.phases[i];
      const state = set(el, i);
      $(el).find('.phase-card__status').text(STATUS[state]);
      $(el).find('.phase-card').attr('aria-label',
        `Abrir fase: ${phase.title}, ${phase.yearsLabel}${state === 'read' ? ' (já lida)' : state === 'current' ? ' (fase atual)' : ''}`);
    });
    $(this.layers.mark).find('.tl-it').each((_, el) => set(el, Number(el.dataset.phaseIndex)));
  }

  renderProgress(progress) {
    const { readCount, total, finished } = progress;
    this.$root.find('.journey__text').text(finished
      ? 'Parabéns! Você concluiu todas as fases.'
      : readCount === 0 ? 'Comece pela primeira fase e avance no seu ritmo.' : `Você leu ${readCount} de ${total} fases.`);
    this.$root.find('.journey__bar i').css('width', `${(readCount / total) * 100}%`);
    this.$root.find('.journey__reset').prop('hidden', readCount === 0);
  }

  cardEl(i) { return $(this.layers.phase).find(`.tl-it[data-index="${i}"]`)[0]; }

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
    const el = this.cardEl(i);
    if (!el) return;
    el.style.display = '';
    el.querySelector('.phase-card')?.focus({ preventScroll: true });
  }

  cardRect(i) {
    return this.cardEl(i)?.querySelector('.phase-card')?.getBoundingClientRect() ?? null;
  }
}
