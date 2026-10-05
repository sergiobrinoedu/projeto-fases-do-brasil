import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { UserModel, toPublicUser } from '../models/UserModel.js';
import { SessionModel } from '../models/SessionModel.js';
import { GoogleAuthService } from './GoogleAuthService.js';
import { HttpError } from './HttpError.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
// hash fictício: mantém o tempo de resposta igual quando o e-mail não existe
const DUMMY = bcrypt.hashSync('dummy-password', 10);

export const AuthService = {
  config: () => ({ googleEnabled: GoogleAuthService.enabled, googleClientId: env.googleClientId || null }),

  validate({ name, email, password }, { requireName }) {
    const out = {};
    if (requireName) {
      out.name = String(name ?? '').trim().replace(/\s+/g, ' ');
      if (out.name.length < 2 || out.name.length > 100) throw new HttpError(422, 'Informe seu nome (2 a 100 caracteres).', 'name');
    }
    out.email = String(email ?? '').trim().toLowerCase();
    if (out.email.length > 160 || !EMAIL_RE.test(out.email)) throw new HttpError(422, 'Informe um e-mail válido.', 'email');
    out.password = String(password ?? '');
    if (requireName && (out.password.length < 8 || out.password.length > 72)) {
      throw new HttpError(422, 'A senha deve ter de 8 a 72 caracteres.', 'password');
    }
    if (!out.password) throw new HttpError(422, 'Informe sua senha.', 'password');
    return out;
  },

  async register(body, meta) {
    const { name, email, password } = this.validate(body, { requireName: true });
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      throw new HttpError(409, existing.passwordHash
        ? 'Este e-mail já está cadastrado. Entre com sua senha.'
        : 'Este e-mail já está cadastrado com o Google. Use "Entrar com o Google".', 'email');
    }
    const user = await UserModel.create({ name, email, passwordHash: await bcrypt.hash(password, 10), authProvider: 'local' });
    return this.open(user, meta);
  },

  async login(body, meta) {
    const { email, password } = this.validate(body, { requireName: false });
    const user = await UserModel.findByEmail(email);
    const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY);
    if (!user || !user.passwordHash || !ok) {
      if (user && !user.passwordHash) throw new HttpError(401, 'Esta conta foi criada com o Google. Use "Entrar com o Google".');
      throw new HttpError(401, 'E-mail ou senha incorretos.');
    }
    return this.open(user, meta);
  },

  async google(credential, meta) {
    const g = await GoogleAuthService.verify(credential);
    let user = await UserModel.findByGoogleSub(g.sub);
    if (!user) {
      const byEmail = await UserModel.findByEmail(g.email);
      if (byEmail) {
        // O Google confirma o e-mail; senha de cadastro não verificado é descartada (evita sequestro de conta).
        user = await UserModel.update(byEmail.id, {
          googleSub: g.sub, avatarUrl: g.picture ?? byEmail.avatarUrl, emailVerified: true,
          ...(byEmail.emailVerified ? {} : { passwordHash: null, authProvider: 'google' }),
        });
      } else {
        // Primeiro acesso pelo Google: grava nome e e-mail no banco.
        user = await UserModel.create({
          name: g.name.slice(0, 100), email: g.email, googleSub: g.sub, avatarUrl: g.picture,
          authProvider: 'google', emailVerified: true,
        });
      }
    }
    return this.open(user, meta);
  },

  async open(user, { ip, userAgent }) {
    const token = crypto.randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + env.sessionDays * 864e5);
    await SessionModel.create({ id: sha256(token), userId: user.id, ip: ip?.slice(0, 45), userAgent: userAgent?.slice(0, 255), expiresAt });
    await UserModel.touchLogin(user.id);
    return { token, expiresAt, user: toPublicUser(user) };
  },

  async resolve(token) {
    if (!token) return null;
    const s = await SessionModel.findValid(sha256(token));
    return s ? { user: toPublicUser(s.user), userId: s.userId } : null;
  },

  logout: (token) => (token ? SessionModel.delete(sha256(token)) : null),
};
