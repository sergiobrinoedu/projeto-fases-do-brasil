import * as THREE from 'three';

const GOLD = 0xe69d3d;
const AMBER = 0xd0842c;
const SAND = 0xdebf88;
const BROWN = 0x895406;

// ---- Ampulheta (unidades da cena) ----
const H = 2;            // meia-altura (centro → ponta de cada bulbo)
const R = 1.15;         // raio máximo do bulbo
const RN = 0.07;        // raio do gargalo
const WALL = 0.05;      // espessura do vidro
const FILL = 0.5;       // fração do bulbo ocupada pela areia

// ---- Tempo (segundos) ----
const RUN_SECONDS = 120; // quanto tempo a areia leva para descer toda
const REST_SECONDS = 1.4; // pausa com tudo embaixo
const FLIP_SECONDS = 2.8; // giro de 180°
const SLUMP_SECONDS = 1.1; // areia "cai" da ponta para o gargalo depois de virar
const STORE = 'fdb.hourglass.v1';

/** Perfil do bulbo: raio em função da distância u ao gargalo (0..H). */
const radius = (u) => {
  const t = Math.min(1, Math.max(0, u / H));
  return RN + (R - RN) * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.85)), 0.72);
};
const inner = (u) => Math.max(0.02, radius(u) - WALL);

// Volume acumulado (do gargalo até u) para converter volume de areia ↔ altura.
const N = 400;
const CUM = new Float32Array(N + 1);
for (let i = 1; i <= N; i++) {
  const u = (i / N) * H;
  CUM[i] = CUM[i - 1] + Math.PI * inner(u) ** 2 * (H / N);
}
const CH = CUM[N];
const V = CH * FILL; // volume total de areia
/** Altura u (0..H) em que o volume acumulado vale v. */
const invC = (v) => {
  if (v <= 0) return 0;
  if (v >= CH) return H;
  let lo = 0; let hi = N;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (CUM[m] < v) lo = m; else hi = m; }
  return ((lo + (v - CUM[lo]) / (CUM[hi] - CUM[lo])) / N) * H;
};
const ease = (x) => (x < 0.5 ? 4 * x ** 3 : 1 - ((-2 * x + 2) ** 3) / 2);
const lerp = (a, b, k) => a + (b - a) * k;

/**
 * View 3D (Three.js): AMPULHETA no fundo. A areia desce conforme o tempo de navegação;
 * quando acaba, a ampulheta vira de ponta-cabeça e a areia volta a descer.
 * Mantém a API usada pelos controllers (setCount/setActive/setScroll/setZoom).
 */
export class SceneView {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouse = { x: 0, y: 0 };
    this.zoom = 0;
    this.zoomNow = 0;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.clock = new THREE.Clock();

    try {
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      this.disabled = true; // sem WebGL: o fundo CSS continua funcionando
      canvas.style.display = 'none';
      return;
    }
    this.renderer.localClippingEnabled = true;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x1f1304, 0.03);
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    this.camera.position.set(0, 0, 12);

    this.#restore();
    this.#buildLights();
    this.#buildHourglass();
    this.#buildDust();
    this.#bind();
    this.resize();
    this.#apply();
    this.#loop();
  }

  // ---------- estado (persistido na sessão: recarregar a página não zera a areia) ----------
  #restore() {
    this.state = 'run';
    this.s = 0;       // fração de areia já caída (0..1)
    this.phaseT = 0;  // tempo dentro do estado atual
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE) ?? 'null');
      if (saved && Number.isFinite(saved.s)) this.s = Math.min(0.995, Math.max(0, saved.s));
    } catch { /* sem storage: começa do zero */ }
    this.saveAt = 0;
  }

  #persist(t) {
    if (t - this.saveAt < 2) return;
    this.saveAt = t;
    try { sessionStorage.setItem(STORE, JSON.stringify({ s: this.state === 'run' ? this.s : 1 })); } catch { /* noop */ }
  }

  #buildLights() {
    this.scene.add(new THREE.AmbientLight(SAND, 0.9));
    const key = new THREE.PointLight(GOLD, 90, 40);
    key.position.set(4, 4, 8);
    const rim = new THREE.PointLight(AMBER, 60, 40);
    rim.position.set(-5, -2, 5);
    this.scene.add(key, rim);
  }

  #buildHourglass() {
    this.outer = new THREE.Group(); // parallax / rolagem
    this.flip = new THREE.Group();  // giro de 180° (em torno do eixo Z)
    this.outer.add(this.flip);
    this.scene.add(this.outer);

    const profile = (off) => {
      const pts = [];
      for (let i = 0; i <= 160; i++) {
        const y = -H + (2 * H * i) / 160;
        pts.push(new THREE.Vector2(off === 0 ? radius(Math.abs(y)) : inner(Math.abs(y)), y));
      }
      return pts;
    };

    // vidro
    const glass = new THREE.Mesh(
      new THREE.LatheGeometry(profile(0), 72),
      new THREE.MeshStandardMaterial({ color: SAND, transparent: true, opacity: 0.16, roughness: 0.08, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false }),
    );
    glass.renderOrder = 3;
    this.flip.add(glass);

    // contorno dourado do vidro (silhueta)
    const edge = (sign) => new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(profile(0).map((p) => new THREE.Vector3(sign * p.x, p.y, 0))),
      new THREE.LineBasicMaterial({ color: SAND, transparent: true, opacity: 0.7 }),
    );
    this.flip.add(edge(1), edge(-1));

    // areia: o mesmo sólido interno, recortado por planos (nível da areia)
    this.local = { bot: new THREE.Plane(), lo: new THREE.Plane(), hi: new THREE.Plane() };
    this.world = { bot: new THREE.Plane(), lo: new THREE.Plane(), hi: new THREE.Plane() };
    const sandMat = (planes) => new THREE.MeshStandardMaterial({
      color: SAND, emissive: AMBER, emissiveIntensity: 0.5, roughness: 0.95, metalness: 0, side: THREE.DoubleSide, clippingPlanes: planes,
    });
    const innerGeo = new THREE.LatheGeometry(profile(1), 64);
    this.sandBot = new THREE.Mesh(innerGeo, sandMat([this.world.bot]));
    this.sandTop = new THREE.Mesh(innerGeo, sandMat([this.world.lo, this.world.hi]));
    this.flip.add(this.sandBot, this.sandTop);

    // montinho no topo da areia de baixo
    this.mound = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 28, 1, true), sandMat([]));
    this.flip.add(this.mound);

    // fio de areia + grãos
    this.stream = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 1, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: SAND, transparent: true, opacity: 0.95 }),
    );
    this.flip.add(this.stream);
    this.grainN = 40;
    this.grainSeed = Float32Array.from({ length: this.grainN }, (_, i) => i / this.grainN);
    this.grains = new THREE.Points(
      new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.grainN * 3), 3)),
      new THREE.PointsMaterial({ color: 0xfff0c8, size: 0.05, transparent: true, opacity: 0.9, depthWrite: false }),
    );
    this.grains.frustumCulled = false;
    this.flip.add(this.grains);

    // moldura: tampas + colunas (marrom/dourado do site)
    const metal = new THREE.MeshStandardMaterial({ color: BROWN, metalness: 0.55, roughness: 0.38, emissive: BROWN, emissiveIntensity: 0.28 });
    const trim = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.7, roughness: 0.3, emissive: GOLD, emissiveIntensity: 0.22 });
    [-1, 1].forEach((k) => {
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.28, R * 1.34, 0.2, 64), metal);
      plate.position.y = k * (H + 0.1);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(R * 1.28, 0.035, 12, 64), trim);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = k * (H + 0.2);
      this.flip.add(plate, ring);
    });
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2 * H + 0.2, 16), metal);
      post.position.set(Math.cos(a) * R * 1.17, 0, Math.sin(a) * R * 1.17);
      this.flip.add(post);
    }
  }

  #buildDust() {
    const n = window.innerWidth < 700 ? 260 : 600;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos.set([(Math.random() - 0.5) * 22, (Math.random() - 0.5) * 16, -6 + Math.random() * 9], i * 3);
    }
    this.dust = new THREE.Points(
      new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)),
      new THREE.PointsMaterial({ color: SAND, size: 0.05, transparent: true, opacity: 0.55, depthWrite: false }),
    );
    this.scene.add(this.dust);
  }

  // ---------- API usada pelos controllers (mantida) ----------
  setCount() {}
  setActive() {}
  setScroll(p) { this.scroll = p; }
  setZoom(on) { this.zoom = on ? 1 : 0; }

  #bind() {
    window.addEventListener('pointermove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.clock.getDelta(); });
  }

  resize() {
    if (this.disabled) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, w < 700 ? 1.5 : 2));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.baseZ = w / h < 0.8 ? 15 : w / h > 2 ? 10 : 11.2;
    this.camera.updateProjectionMatrix();
  }

  // ---------- areia ----------
  /** Posiciona os planos de corte (no espaço local da ampulheta) conforme o estado. */
  #apply(slumpK = 0) {
    const { bot, lo, hi } = this.local;
    let ut = 0; let ub = H; let loY = 0; let hiY = 0;
    let showBot = false; let showTop = false; let showMound = false; let streamOn = false;

    if (this.state === 'run' || this.state === 'rest' || this.state === 'flip') {
      const s = this.state === 'run' ? this.s : 1;
      ut = invC((1 - s) * V);
      ub = invC(CH - s * V);
      hiY = ut;
      showTop = s < 0.999;
      showBot = s > 0.001;
      showMound = showBot;
      streamOn = this.state === 'run' && s > 0.001 && s < 0.999;
    } else if (this.state === 'slump') {
      const e = ease(slumpK);
      const ub1 = invC(CH - V);
      loY = lerp(ub1, 0, e);
      hiY = lerp(H, invC(V), e);
      showTop = true;
      streamOn = e > 0.45;
    }

    bot.set(new THREE.Vector3(0, -1, 0), -ub); // mantém y ≤ -ub
    lo.set(new THREE.Vector3(0, 1, 0), -loY);  // mantém y ≥ loY
    hi.set(new THREE.Vector3(0, -1, 0), hiY);  // mantém y ≤ hiY
    this.sandBot.visible = showBot;
    this.sandTop.visible = showTop;

    // montinho + fio
    let floorY = -H + 0.02;
    this.mound.visible = showMound;
    if (showMound) {
      const yb = -ub;
      const rm = Math.min(inner(ub) * 0.72, 0.5);
      const mh = rm * 0.55;
      this.mound.scale.set(rm, mh, rm);
      this.mound.position.y = yb + mh / 2;
      floorY = yb + mh;
    }
    this.stream.visible = this.grains.visible = streamOn;
    if (streamOn) {
      const top = 0.1;
      const len = Math.max(0.01, top - floorY);
      this.stream.scale.set(1, len, 1);
      this.stream.position.y = (top + floorY) / 2;
      this.streamTop = top;
      this.streamLen = len;
    }
  }

  #toWorldPlanes() {
    this.flip.updateMatrixWorld(true);
    ['bot', 'lo', 'hi'].forEach((k) => this.world[k].copy(this.local[k]).applyMatrix4(this.flip.matrixWorld));
  }

  #step(dt, t) {
    const motion = this.reduced ? 0.15 : 1;
    this.phaseT += dt;

    if (this.state === 'run') {
      this.s += dt / RUN_SECONDS;
      if (this.s >= 1) { this.s = 1; this.state = 'rest'; this.phaseT = 0; }
      this.#apply();
    } else if (this.state === 'rest') {
      this.#apply();
      if (this.phaseT >= REST_SECONDS) { this.state = 'flip'; this.phaseT = 0; }
    } else if (this.state === 'flip') {
      const dur = this.reduced ? 0.8 : FLIP_SECONDS;
      const k = Math.min(1, this.phaseT / dur);
      const e = ease(k);
      this.flip.rotation.z = Math.PI * e;
      const lift = Math.sin(Math.PI * e);
      this.flip.scale.setScalar(1 + 0.07 * lift);
      this.flip.position.z = lift * 0.8;
      this.#apply();
      if (k >= 1) { // a ampulheta é simétrica: zera a rotação e a areia passa a estar em cima
        this.flip.rotation.z = 0; this.flip.scale.setScalar(1); this.flip.position.z = 0;
        this.s = 0; this.state = 'slump'; this.phaseT = 0;
      }
    } else if (this.state === 'slump') {
      const k = Math.min(1, this.phaseT / (this.reduced ? 0.4 : SLUMP_SECONDS));
      this.#apply(k);
      if (k >= 1) { this.state = 'run'; this.phaseT = 0; }
    }

    // grãos caindo pelo fio
    if (this.grains.visible && !this.reduced) {
      const a = this.grains.geometry.attributes.position;
      for (let i = 0; i < this.grainN; i++) {
        const f = (t * 1.6 + this.grainSeed[i]) % 1;
        a.setXYZ(i, Math.sin(i * 12.9 + t * 3) * 0.018, this.streamTop - f * this.streamLen, Math.cos(i * 7.3 + t * 3) * 0.018);
      }
      a.needsUpdate = true;
    } else if (this.grains.visible) this.grains.visible = false;
    return motion;
  }

  #loop = () => {
    requestAnimationFrame(this.#loop);
    if (document.hidden) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;
    const motion = this.#step(dt, t);
    this.#persist(t);

    this.zoomNow += (this.zoom - this.zoomNow) * Math.min(1, dt * 3.2);
    this.scrollNow = (this.scrollNow ?? 0) + ((this.scroll ?? 0) - (this.scrollNow ?? 0)) * Math.min(1, dt * 2.2);

    // parallax do mouse, flutuação suave e acompanhamento da rolagem (fundo contínuo)
    const o = this.outer;
    o.rotation.y += (this.mouse.x * 0.4 - o.rotation.y) * Math.min(1, dt * 2.5);
    o.rotation.x += (this.mouse.y * 0.1 - o.rotation.x) * Math.min(1, dt * 2.5);
    o.position.y = this.scrollNow * 2.4 + Math.sin(t * 0.6) * 0.1 * motion;
    this.dust.position.y = this.scrollNow * 1.5;
    this.dust.rotation.y += dt * 0.01 * (1 + this.zoomNow * 3) * motion;

    this.camera.position.z += (this.baseZ - this.zoomNow * 3 - this.camera.position.z) * Math.min(1, dt * 3);
    this.camera.position.x += (this.mouse.x * 0.5 - this.camera.position.x) * Math.min(1, dt * 2.5);
    this.camera.lookAt(0, 0, 0);

    this.#toWorldPlanes();
    this.renderer.render(this.scene, this.camera);
  };
}
