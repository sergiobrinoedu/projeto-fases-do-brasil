import { bus } from '@/infra/EventBus.js';

/**
 * Controller: mantém o fundo CONTÍNUO ao rolar a página — o brilho do fundo e a
 * cena 3D acompanham a rolagem de forma suave (sem cortes) — e liga os balões.
 */
export class BackgroundController {
  #raf = 0;

  constructor({ sceneView, bubblesView }) {
    this.scene = sceneView;
    this.bubbles = bubblesView;
  }

  init() {
    const update = () => {
      this.#raf = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      document.documentElement.style.setProperty('--flow', `${(p * 100).toFixed(2)}%`);
      this.scene.setScroll(p, window.scrollY);
    };
    const schedule = () => { if (!this.#raf) this.#raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    bus.on('page:changed', schedule);
    bus.on('timeline:loaded', (m) => { this.bubbles.start(m.phases); setTimeout(schedule, 300); });
    update();
  }
}
