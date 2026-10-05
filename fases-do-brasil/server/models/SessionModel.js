import { prisma } from './prisma.js';

export const SessionModel = {
  create: (data) => prisma.session.create({ data }),
  findValid: (id) => prisma.session.findFirst({ where: { id, expiresAt: { gt: new Date() } }, include: { user: true } }),
  delete: (id) => prisma.session.deleteMany({ where: { id } }),
  purgeExpired: () => prisma.session.deleteMany({ where: { expiresAt: { lte: new Date() } } }),
};
