import { env } from '../config/env.js';
import { AuthService } from '../services/AuthService.js';
import { HttpError } from '../services/HttpError.js';

export const cookieOptions = (expires) => ({
  httpOnly: true, sameSite: 'lax', secure: env.isProd, path: '/', ...(expires ? { expires } : {}),
});

/** Preenche req.auth ({user,userId}) quando há cookie de sessão válido. */
export async function loadSession(req, _res, next) {
  try { req.auth = await AuthService.resolve(req.cookies?.[env.cookieName]); next(); } catch (e) { next(e); }
}

export function requireAuth(req, _res, next) {
  next(req.auth ? undefined : new HttpError(401, 'Faça login para continuar.'));
}

/** Mutações só aceitam JSON (bloqueia envio de formulários de outros sites — CSRF). */
export function jsonOnly(req, _res, next) {
  // req.is() é null quando não há corpo; false quando há corpo que não é JSON.
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.is('application/json') === false) {
    return next(new HttpError(415, 'Use application/json.'));
  }
  next();
}
