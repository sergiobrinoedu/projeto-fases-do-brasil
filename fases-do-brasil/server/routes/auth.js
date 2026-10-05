import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { AuthService } from '../services/AuthService.js';
import { cookieOptions } from '../middleware/auth.js';
import { HttpError } from '../services/HttpError.js';

export const authRouter = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.' },
});

const meta = (req) => ({ ip: req.ip, userAgent: req.get('user-agent') });
const reply = (res, { token, expiresAt, user }, status = 200) => {
  res.cookie(env.cookieName, token, cookieOptions(expiresAt));
  res.status(status).json({ user });
};
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

authRouter.get('/config', (_req, res) => res.json(AuthService.config()));
authRouter.get('/me', (req, res) => res.json({ user: req.auth?.user ?? null }));

authRouter.post('/register', limiter, wrap(async (req, res) => reply(res, await AuthService.register(req.body, meta(req)), 201)));
authRouter.post('/login', limiter, wrap(async (req, res) => reply(res, await AuthService.login(req.body, meta(req)))));
authRouter.post('/google', limiter, wrap(async (req, res) => {
  if (!req.body?.credential) throw new HttpError(422, 'Credencial do Google ausente.');
  reply(res, await AuthService.google(req.body.credential, meta(req)));
}));
authRouter.post('/logout', wrap(async (req, res) => {
  await AuthService.logout(req.cookies?.[env.cookieName]);
  res.clearCookie(env.cookieName, cookieOptions());
  res.json({ ok: true });
}));
