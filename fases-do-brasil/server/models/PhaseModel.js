import { prisma } from './prisma.js';

/** Converte linhas do banco para o mesmo formato de src/infra/data/phases.data.js. */
const toPhase = (p) => ({
  id: p.id, order: p.sortOrder, period: p.periodId, title: p.title, subtitle: p.subtitle,
  startYear: p.startYear, endYear: p.endYear, art: p.art, summary: p.summary,
  description: p.paragraphs.map((x) => x.content),
  highlights: p.highlights.map((x) => x.text),
  ...(p.images.length ? { images: p.images.map((x) => x.url) } : {}),
});

const include = {
  paragraphs: { orderBy: { position: 'asc' } },
  highlights: { orderBy: { position: 'asc' } },
  images: { orderBy: { position: 'asc' } },
};

export const PhaseModel = {
  async periods() {
    const rows = await prisma.period.findMany({ orderBy: { sortOrder: 'asc' } });
    return rows.map((p) => ({ id: p.id, name: p.name, startYear: p.startYear, endYear: p.endYear, description: p.description }));
  },
  async phases() {
    return (await prisma.phase.findMany({ orderBy: { sortOrder: 'asc' }, include })).map(toPhase);
  },
  async phase(id) {
    const p = await prisma.phase.findUnique({ where: { id }, include });
    return p ? toPhase(p) : null;
  },
  async ids() {
    return (await prisma.phase.findMany({ select: { id: true }, orderBy: { sortOrder: 'asc' } })).map((p) => p.id);
  },
};
