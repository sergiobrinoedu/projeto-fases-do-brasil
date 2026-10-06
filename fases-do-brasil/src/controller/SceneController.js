import { bus } from '@/infra/EventBus.js';

/** Controller: conecta eventos do domínio à cena 3D. */
export class SceneController {
  constructor(sceneView) {
    this.scene = sceneView;
  }

  init() {
    bus.on('timeline:loaded', (m) => { this.scene.setCount(m.phases.length); this.scene.setActive(m.activeIndex); });
    bus.on('timeline:active', ({ index }) => this.scene.setActive(index));
    bus.on('phase:open', ({ index }) => { this.scene.setActive(index); this.scene.setZoom(true); this.scene.setReading(true); });
    bus.on('phase:close', () => { this.scene.setZoom(false); this.scene.setReading(false); });
    bus.on('timeline:zoom', ({ z }) => this.scene.setZoomLevel(z));
    bus.on('page:changed', ({ name }) => { this.scene.setPage(name); this.scene.ping(2.5); });
    let read = null;
    bus.on('progress:changed', (p) => {
      if (read !== null && p.readCount > read) this.scene.addFlow(0.05 * (p.readCount - read));
      read = p.readCount;
    });
  }
}
