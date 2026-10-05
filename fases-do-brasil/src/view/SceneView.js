import * as THREE from 'three';

const GOLD = 0xe69d3d;
const AMBER = 0xd0842c;
const SAND = 0xdebf88;

/**
 * View 3D (Three.js): esfera armilar + anel de marcos (um por fase) + poeira dourada.
 * Reage ao mouse (parallax), à fase ativa e ao "zoom" de abertura de uma fase.
 */
export class SceneView {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouse = { x: 0, y: 0 };
    this.zoom = 0; // 0..1 (alvo)
    this.zoomNow = 0;
    this.targetRing = 0;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.clock = new THREE.Clock();

    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      this.disabled = true; // sem WebGL: o fundo CSS continua funcionando
      canvas.style.display = 'none';
      return;
    }

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x1f1304, 0.045);
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    this.camera.position.set(0, 0, 9);

    this.#buildLights();
    this.#buildArmillary();
    this.#buildDust();
    this.#bind();
    this.resize();
    this.#loop();
  }

  #buildLights() {
    this.scene.add(new THREE.AmbientLight(SAND, 0.7));
    const key = new THREE.PointLight(GOLD, 60, 30);
    key.position.set(4, 3, 6);
    const rim = new THREE.PointLight(AMBER, 40, 30);
    rim.position.set(-5, -2, 4);
    this.scene.add(key, rim);
  }

  #buildArmillary() {
    this.armillary = new THREE.Group();
    const mat = (c, e = 0.25) => new THREE.MeshStandardMaterial({ color: c, metalness: 0.85, roughness: 0.32, emissive: c, emissiveIntensity: e });

    this.rings = [2.7, 2.2, 1.7].map((r, i) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 16, 140), mat(i === 1 ? SAND : GOLD));
      m.rotation.set(i * 0.9, i * 0.5, 0);
      this.armillary.add(m);
      return m;
    });

    this.core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.75, 1),
      new THREE.MeshStandardMaterial({ color: AMBER, flatShading: true, metalness: 0.6, roughness: 0.4, emissive: 0x895406, emissiveIntensity: 0.5 }),
    );
    this.armillary.add(this.core);

    this.milestones = new THREE.Group();
    this.armillary.add(this.milestones);
    this.armillary.position.set(0, 0, 0);
    this.scene.add(this.armillary);
  }

  /** Cria um marco (octaedro) por fase, em anel. */
  setCount(count) {
    if (this.disabled) return;
    this.milestones.clear();
    this.count = count;
    this.marks = Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2;
      const m = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.13, 0),
        new THREE.MeshStandardMaterial({ color: SAND, emissive: SAND, emissiveIntensity: 0.2, metalness: 0.7, roughness: 0.3 }),
      );
      m.position.set(Math.cos(a) * 3.4, Math.sin(a) * 3.4, 0);
      this.milestones.add(m);
      return m;
    });
    this.setActive(0);
  }

  setActive(index) {
    if (this.disabled || !this.count) return;
    this.activeIndex = index;
    this.targetRing = -(index / this.count) * Math.PI * 2;
    this.marks.forEach((m, i) => {
      const on = i === index;
      m.userData.scale = on ? 2.6 : 1;
      m.material.emissiveIntensity = on ? 1.4 : 0.2;
      m.material.color.setHex(on ? GOLD : SAND);
    });
  }

  #buildDust() {
    const mobile = window.innerWidth < 700;
    const n = mobile ? 450 : 1100;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 4 + Math.random() * 14;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      pos.set([r * Math.sin(p) * Math.cos(t), r * Math.sin(p) * Math.sin(t), r * Math.cos(p) - 4], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.dust = new THREE.Points(geo, new THREE.PointsMaterial({ color: SAND, size: 0.055, transparent: true, opacity: 0.7, depthWrite: false }));
    this.scene.add(this.dust);
  }

  #bind() {
    this.onMove = (e) => {
      this.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', this.onMove, { passive: true });
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.clock.getDelta();
    });
  }

  /** Rolagem da página (0..1): a cena desce junto, mantendo o fundo contínuo. */
  setScroll(p) {
    this.scroll = p;
  }

  /** Zoom-in (true) ao abrir uma fase / volta ao normal (false). */
  setZoom(on) {
    this.zoom = on ? 1 : 0;
  }

  resize() {
    if (this.disabled) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, w < 700 ? 1.5 : 2));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.baseZ = w / h < 0.8 ? 12.5 : 9; // celular em pé: afasta a câmera
    this.camera.updateProjectionMatrix();
  }

  #loop = () => {
    requestAnimationFrame(this.#loop);
    if (document.hidden) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;
    const motion = this.reduced ? 0.15 : 1;

    this.zoomNow += (this.zoom - this.zoomNow) * Math.min(1, dt * 3.2);
    const boost = 1 + this.zoomNow * 4;

    this.rings.forEach((r, i) => {
      r.rotation.x += dt * 0.12 * (i + 1) * boost * motion;
      r.rotation.y += dt * 0.09 * (3 - i) * boost * motion;
    });
    this.core.rotation.y += dt * 0.4 * boost * motion;
    this.core.rotation.x += dt * 0.2 * motion;
    this.dust.rotation.y += dt * 0.012 * boost * motion;

    // anel de marcos gira até a fase ativa
    this.milestones.rotation.z += (this.targetRing - this.milestones.rotation.z) * Math.min(1, dt * 3);
    this.marks?.forEach((m) => {
      const s = m.userData.scale ?? 1;
      m.scale.setScalar(m.scale.x + (s - m.scale.x) * Math.min(1, dt * 6));
      m.rotation.y += dt * 1.2 * motion;
    });

    // parallax + zoom da câmera
    const targetZ = this.baseZ - this.zoomNow * 4.6;
    this.camera.position.x += (this.mouse.x * 0.9 - this.camera.position.x) * Math.min(1, dt * 2.5);
    const sc = this.scroll ?? 0;
    this.scrollNow = (this.scrollNow ?? 0) + (sc - (this.scrollNow ?? 0)) * Math.min(1, dt * 2.2); // suaviza
    const camY = -this.scrollNow * 3.2;
    this.camera.position.y += (camY - this.mouse.y * 0.6 - this.camera.position.y) * Math.min(1, dt * 2.5);
    this.camera.position.z += (targetZ - this.camera.position.z) * Math.min(1, dt * 3);
    this.camera.lookAt(0, camY, 0);
    this.armillary.position.y = -this.scrollNow * 2.4 + Math.sin(t * 0.6) * 0.12 * motion;
    this.dust.position.y = this.scrollNow * 1.5;
    this.dust.rotation.y += this.scrollNow * dt * 0.02 * motion;

    this.renderer.render(this.scene, this.camera);
  };
}
