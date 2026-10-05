import { session } from '@/auth/Session.js';

const PERMISSIONS = {
  guest: ['view'],
  editor: ['view', 'edit'],
};

/** Verificação de permissão por papel (RBAC simples). */
export const AuthGuard = {
  can(action) {
    return (PERMISSIONS[session.role] ?? PERMISSIONS.guest).includes(action);
  },
};
