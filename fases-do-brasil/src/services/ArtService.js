/**
 * Strategy Pattern: cada "art" é uma estratégia que desenha um motivo SVG
 * original (sem direitos autorais) na paleta do projeto. Gera 3 variações
 * por fase para alimentar as galerias quando não há fotos reais.
 */
const C = { sand: '#debf88', amber: '#d0842c', brown: '#895406', gold: '#e69d3d', dark: '#2a1804', ink: '#4a2c04' };

const MOTIFS = {
  ship: () => `
    <path d="M-190 70 Q0 130 190 70 L150 120 L-150 120Z" fill="${C.dark}"/>
    <path d="M-170 60 L170 60 L140 110 L-140 110Z" fill="${C.ink}"/>
    <rect x="-4" y="-190" width="8" height="250" fill="${C.dark}"/>
    <path d="M-125 -165 Q0 -120 125 -165 L112 -20 Q0 15 -112 -20Z" fill="${C.sand}" stroke="${C.dark}" stroke-width="4"/>
    <rect x="-9" y="-130" width="18" height="76" fill="${C.brown}"/><rect x="-34" y="-104" width="68" height="18" fill="${C.brown}"/>
    <path d="M6 -190 L84 -150 L6 -135Z" fill="${C.gold}" stroke="${C.dark}" stroke-width="3"/>`,
  map: (id) => `
    <clipPath id="${id}"><path d="M-150 -150 Q-70 -180 20 -140 Q120 -100 160 -10 Q180 70 120 150 L-70 150 Q-100 30 -150 -150Z"/></clipPath>
    <path d="M-150 -150 Q-70 -180 20 -140 Q120 -100 160 -10 Q180 70 120 150 L-70 150 Q-100 30 -150 -150Z" fill="${C.sand}" stroke="${C.dark}" stroke-width="5"/>
    <g clip-path="url(#${id})" stroke="${C.brown}" stroke-width="4">${[-110, -70, -30, 10, 50, 90, 130].map((y) => `<line x1="-200" y1="${y}" x2="220" y2="${y + 14}"/>`).join('')}</g>
    <g stroke="${C.dark}" stroke-width="7" stroke-linecap="round">${[-230, -205, -180].map((x, i) => `<line x1="${x}" y1="140" x2="${x + 6}" y2="${40 - i * 16}"/>`).join('')}</g>
    <path d="M-236 70 q-30 -20 -50 -50 M-198 40 q30 -25 52 -60" stroke="${C.gold}" stroke-width="6" fill="none"/>`,
  palace: () => `
    <path d="M-190 40 L0 -110 L190 40Z" fill="${C.brown}" stroke="${C.dark}" stroke-width="4"/>
    <rect x="-180" y="40" width="360" height="22" fill="${C.sand}" stroke="${C.dark}" stroke-width="3"/>
    ${[-140, -84, -28, 28, 84, 140].map((x) => `<rect x="${x - 14}" y="62" width="28" height="100" fill="${C.sand}" stroke="${C.dark}" stroke-width="3"/>`).join('')}
    <rect x="-200" y="162" width="400" height="16" fill="${C.amber}" stroke="${C.dark}" stroke-width="3"/>
    <circle cx="0" cy="-20" r="26" fill="${C.gold}" stroke="${C.dark}" stroke-width="4"/>
    <path d="M-20 -150 l8 -22 l12 16 l12 -16 l8 22Z" fill="${C.gold}" stroke="${C.dark}" stroke-width="3" transform="translate(0 -6)"/>`,
  crown: () => `
    <g stroke="${C.gold}" stroke-width="5" opacity=".7">${Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2; return `<line x1="${Math.cos(a) * 140}" y1="${Math.sin(a) * 140 - 10}" x2="${Math.cos(a) * 215}" y2="${Math.sin(a) * 215 - 10}"/>`; }).join('')}</g>
    <path d="M-120 60 L-145 -60 L-65 -10 L0 -100 L65 -10 L145 -60 L120 60Z" fill="${C.gold}" stroke="${C.dark}" stroke-width="6" stroke-linejoin="round"/>
    <rect x="-125" y="60" width="250" height="34" rx="6" fill="${C.amber}" stroke="${C.dark}" stroke-width="6"/>
    <circle cx="0" cy="-100" r="12" fill="${C.sand}" stroke="${C.dark}" stroke-width="4"/><circle cx="-145" cy="-60" r="10" fill="${C.sand}" stroke="${C.dark}" stroke-width="4"/><circle cx="145" cy="-60" r="10" fill="${C.sand}" stroke="${C.dark}" stroke-width="4"/>
    <circle cx="-60" cy="77" r="9" fill="${C.brown}"/><circle cx="0" cy="77" r="9" fill="${C.sand}"/><circle cx="60" cy="77" r="9" fill="${C.brown}"/>`,
  torches: () => `
    <g transform="rotate(-14) translate(0 40)"><path d="M-70 40 L-85 -40 L-40 -10 L0 -60 L40 -10 L85 -40 L70 40Z" fill="${C.gold}" stroke="${C.dark}" stroke-width="5" stroke-linejoin="round"/><rect x="-72" y="40" width="144" height="22" rx="4" fill="${C.amber}" stroke="${C.dark}" stroke-width="5"/></g>
    ${[-170, -85, 85, 170].map((x, i) => `<g transform="translate(${x} ${i % 2 ? 20 : 0})"><rect x="-7" y="-20" width="14" height="150" rx="5" fill="${C.dark}"/><path d="M0 -110 Q40 -60 18 -22 Q0 -4 -18 -22 Q-40 -60 0 -110Z" fill="${C.gold}" stroke="${C.dark}" stroke-width="4"/><path d="M0 -70 Q20 -44 8 -26 Q0 -18 -8 -26 Q-20 -44 0 -70Z" fill="${C.sand}"/></g>`).join('')}`,
  train: () => `
    <rect x="-190" y="-10" width="250" height="100" rx="14" fill="${C.brown}" stroke="${C.dark}" stroke-width="5"/>
    <rect x="40" y="-70" width="110" height="160" rx="10" fill="${C.amber}" stroke="${C.dark}" stroke-width="5"/>
    <rect x="62" y="-48" width="66" height="50" rx="6" fill="${C.sand}" stroke="${C.dark}" stroke-width="4"/>
    <rect x="-150" y="-70" width="34" height="64" fill="${C.dark}"/><path d="M-160 -70 h54 l-8 -22 h-38Z" fill="${C.dark}"/>
    <path d="M150 90 L200 130 L-190 130 L-190 90Z" fill="${C.ink}"/>
    ${[-120, -50, 20, 100].map((x, i) => `<circle cx="${x}" cy="112" r="${i === 3 ? 28 : 34}" fill="${C.sand}" stroke="${C.dark}" stroke-width="6"/><circle cx="${x}" cy="112" r="8" fill="${C.dark}"/>`).join('')}
    <g fill="${C.sand}" opacity=".85"><circle cx="-150" cy="-120" r="20"/><circle cx="-120" cy="-150" r="28"/><circle cx="-80" cy="-185" r="36"/></g>`,
  coffee: () => `
    <path d="M-170 140 Q-60 40 -20 -40 Q10 -100 120 -150" fill="none" stroke="${C.dark}" stroke-width="10" stroke-linecap="round"/>
    ${[[-120, 90, -35], [-70, 55, 50], [-30, -5, -40], [10, -50, 55], [60, -100, -30], [100, -140, 40]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="62" ry="24" transform="rotate(${r} ${x} ${y})" fill="${C.brown}" stroke="${C.dark}" stroke-width="4"/>`).join('')}
    ${[[-45, 75], [-52, 98], [-8, 25], [-14, 50], [32, -30], [40, -8]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="${C.gold}" stroke="${C.dark}" stroke-width="4"/>`).join('')}`,
  factory: () => `
    <path d="M-200 150 V20 L-130 -20 V20 L-60 -20 V20 L10 -20 V20 H110 V150Z" fill="${C.brown}" stroke="${C.dark}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="110" y="-120" width="40" height="270" fill="${C.amber}" stroke="${C.dark}" stroke-width="5"/><rect x="164" y="-70" width="34" height="220" fill="${C.amber}" stroke="${C.dark}" stroke-width="5"/>
    <g fill="${C.sand}" opacity=".85"><circle cx="130" cy="-150" r="22"/><circle cx="160" cy="-185" r="30"/><circle cx="181" cy="-100" r="18"/></g>
    ${[-170, -110, -50, 10].map((x) => `<rect x="${x}" y="50" width="34" height="34" fill="${C.sand}" stroke="${C.dark}" stroke-width="3"/>`).join('')}
    <g transform="translate(-20 -95)"><circle r="46" fill="none" stroke="${C.gold}" stroke-width="22" stroke-dasharray="14 12.1"/><circle r="38" fill="none" stroke="${C.dark}" stroke-width="5"/><circle r="12" fill="${C.dark}"/></g>`,
  arches: () => `
    ${[-110, 0, 110].map((x, i) => `<path d="M${x - 150} 140 Q${x + (i - 1) * 20} -240 ${x + 150} 140" fill="none" stroke="${i === 1 ? C.gold : C.sand}" stroke-width="16" stroke-linecap="round"/>`).join('')}
    <g stroke="${C.dark}" stroke-width="3" opacity=".7">${Array.from({ length: 13 }, (_, i) => `<line x1="${-190 + i * 32}" y1="140" x2="${-60 + i * 10}" y2="${-70 + Math.abs(6 - i) * 4}"/>`).join('')}</g>
    <rect x="-230" y="140" width="460" height="22" fill="${C.ink}" stroke="${C.dark}" stroke-width="4"/>`,
  bars: () => `
    <circle cx="0" cy="-20" r="110" fill="${C.gold}" opacity=".85"/>
    <rect x="-200" y="-170" width="400" height="26" fill="${C.dark}"/><rect x="-200" y="130" width="400" height="26" fill="${C.dark}"/>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="${-185 + i * 46}" y="-150" width="18" height="290" fill="${C.dark}"/>`).join('')}`,
  book: () => `
    <g stroke="${C.gold}" stroke-width="6" opacity=".8">${Array.from({ length: 9 }, (_, i) => { const a = Math.PI + (i / 8) * Math.PI; return `<line x1="${Math.cos(a) * 120}" y1="${Math.sin(a) * 120 - 30}" x2="${Math.cos(a) * 200}" y2="${Math.sin(a) * 200 - 30}"/>`; }).join('')}</g>
    <path d="M0 -20 Q-90 -50 -190 -20 V130 Q-90 100 0 130Z" fill="${C.sand}" stroke="${C.dark}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M0 -20 Q90 -50 190 -20 V130 Q90 100 0 130Z" fill="${C.gold}" stroke="${C.dark}" stroke-width="6" stroke-linejoin="round"/>
    <g stroke="${C.brown}" stroke-width="5" stroke-linecap="round">${[10, 40, 70].map((y) => `<line x1="-150" y1="${y}" x2="-35" y2="${y + 4}"/><line x1="35" y1="${y + 4}" x2="150" y2="${y}"/>`).join('')}</g>
    ${[[0, -90, 22], [-70, -70, 14], [70, -70, 14]].map(([x, y, r]) => `<polygon points="${Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr = i % 2 ? r * 0.45 : r; return `${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`; }).join(' ')}" fill="${C.sand}" stroke="${C.dark}" stroke-width="3"/>`).join('')}`,
};

const wrap = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const VARIANTS = [
  // 0 — cena ao pôr do sol
  (phase, motif) => wrap(`
    <defs><linearGradient id="g${phase.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sand}"/><stop offset="1" stop-color="${C.gold}"/></linearGradient></defs>
    <rect width="800" height="500" fill="url(#g${phase.id})"/>
    <circle cx="640" cy="110" r="64" fill="${C.amber}" opacity=".9"/><circle cx="640" cy="110" r="94" fill="none" stroke="${C.amber}" stroke-width="3" opacity=".5"/>
    <path d="M0 410 Q200 350 400 400 T800 380 V500 H0Z" fill="${C.brown}"/><path d="M0 450 Q250 410 480 450 T800 440 V500 H0Z" fill="${C.dark}"/>
    <g transform="translate(400 250) scale(.92)">${motif}</g>`),
  // 1 — pergaminho com ano e título
  (phase, motif) => wrap(`
    <rect width="800" height="500" fill="${C.sand}"/>
    <g stroke="${C.gold}" stroke-width="2" opacity=".5">${Array.from({ length: 24 }, (_, i) => `<line x1="0" y1="${i * 22}" x2="800" y2="${i * 22 + 8}"/>`).join('')}</g>
    <rect x="26" y="26" width="748" height="448" fill="none" stroke="${C.brown}" stroke-width="6"/><rect x="40" y="40" width="720" height="420" fill="none" stroke="${C.brown}" stroke-width="2"/>
    <g transform="translate(205 255) scale(.62)">${motif}</g>
    <text x="600" y="200" text-anchor="middle" font-family="Georgia,serif" font-size="46" font-weight="700" fill="${C.brown}">${phase.startYear}</text>
    <text x="600" y="246" text-anchor="middle" font-family="Georgia,serif" font-size="30" fill="${C.amber}">${phase.endYear ?? 'Presente'}</text>
    <line x1="520" y1="268" x2="680" y2="268" stroke="${C.brown}" stroke-width="3"/>
    <text x="600" y="306" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-style="italic" fill="${C.ink}">${esc(phase.subtitle)}</text>`),
  // 2 — gravura escura com padrão
  (phase, motif) => wrap(`
    <defs><radialGradient id="r${phase.id}"><stop offset="0" stop-color="${C.gold}" stop-opacity=".55"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></radialGradient>
    <pattern id="p${phase.id}" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M22 2 L42 22 L22 42 L2 22Z" fill="none" stroke="${C.amber}" stroke-width="1.5" opacity=".35"/></pattern></defs>
    <rect width="800" height="500" fill="${C.dark}"/><rect width="800" height="500" fill="url(#p${phase.id})"/>
    <circle cx="400" cy="250" r="260" fill="url(#r${phase.id})"/>
    <circle cx="400" cy="250" r="190" fill="none" stroke="${C.gold}" stroke-width="3" opacity=".6"/><circle cx="400" cy="250" r="204" fill="none" stroke="${C.gold}" stroke-width="1.5" stroke-dasharray="4 8" opacity=".6"/>
    <g transform="translate(400 255) scale(.66)">${motif}</g>
    <text x="400" y="470" text-anchor="middle" font-family="Georgia,serif" font-size="22" letter-spacing="4" fill="${C.sand}">${esc(phase.title.toUpperCase())}</text>`),
];

const toUri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export class ArtService {
  #cache = new Map();

  /** Retorna `count` imagens (URLs reais se existirem, senão ilustrações geradas). */
  imagesFor(phase, count = 3) {
    if (phase.images?.length) return phase.images;
    return Array.from({ length: count }, (_, i) => this.render(phase, i % VARIANTS.length));
  }

  cover(phase) {
    return phase.images?.[0] ?? this.render(phase, 0);
  }

  render(phase, variant = 0) {
    const key = `${phase.id}:${variant}`;
    if (!this.#cache.has(key)) {
      const motif = (MOTIFS[phase.art] ?? MOTIFS.ship)(`c${phase.id}`);
      this.#cache.set(key, toUri(VARIANTS[variant](phase, motif)));
    }
    return this.#cache.get(key);
  }
}

export const art = new ArtService();
