import { prisma } from './prisma.js';

export const ProgressModel = {
  async get(userId) {
    const [reads, journey] = await Promise.all([
      prisma.userPhaseRead.findMany({ where: { userId } }),
      prisma.userJourney.findUnique({ where: { userId } }),
    ]);
    return { read: reads.map((r) => r.phaseId), current: journey ? journey.currentIndex : undefined };
  },
  /** Substitui o progresso do usuário (transação). */
  save(userId, { read, current }) {
    return prisma.$transaction([
      prisma.userPhaseRead.deleteMany({ where: { userId } }),
      prisma.userPhaseRead.createMany({ data: read.map((phaseId) => ({ userId, phaseId })) }),
      prisma.userJourney.upsert({
        where: { userId }, create: { userId, currentIndex: current }, update: { currentIndex: current },
      }),
    ]);
  },
};
