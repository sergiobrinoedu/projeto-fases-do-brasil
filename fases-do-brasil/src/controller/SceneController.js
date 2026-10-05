import { bus } from '@/infra/EventBus.js';

/** Controller: conecta eventos do domínio à cena 3D. */
export class SceneController {
  constructor(sceneView) {
    this.scene = sceneView;
  }

  init() {
    bus.on('timeline:loaded', (m) => { this.scene.setCount(m.phases.length); this.scene.setActive(m.activeIndex); });
    bus.on('timeline:active', ({ index }) => this.scene.setActive(index));
    bus.on('phase:open', ({ index }) => { this.scene.setActive(index); this.scene.setZoom(true); });
    bus.on('phase:close', () => this.scene.setZoom(false));
  }
}
