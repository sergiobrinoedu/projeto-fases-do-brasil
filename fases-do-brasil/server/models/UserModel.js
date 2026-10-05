import { prisma } from './prisma.js';

/** Remove dados sensíveis e converte BigInt → number para sair em JSON. */
export const toPublicUser = (u) => u && ({
  id: Number(u.id), name: u.name, email: u.email, avatarUrl: u.avatarUrl,
  provider: u.authProvider, hasPassword: Boolean(u.passwordHash), role: u.role,
});

export const UserModel = {
  findById: (id) => prisma.user.findUnique({ where: { id: BigInt(id) } }),
  findByEmail: (email) => prisma.user.findUnique({ where: { email } }),
  findByGoogleSub: (googleSub) => prisma.user.findUnique({ where: { googleSub } }),
  create: (data) => prisma.user.create({ data }),
  update: (id, data) => prisma.user.update({ where: { id }, data }),
  touchLogin: (id) => prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } }),
};
