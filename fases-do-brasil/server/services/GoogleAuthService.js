import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { HttpError } from './HttpError.js';

let client;

/** Valida o ID token do "Entrar com o Google" (biblioteca open source google-auth-library). */
export const GoogleAuthService = {
  get enabled() { return Boolean(env.googleClientId); },

  async verify(credential) {
    if (!this.enabled) throw new HttpError(503, 'Login com o Google ainda não foi configurado (GOOGLE_CLIENT_ID).');
    client ??= new OAuth2Client(env.googleClientId);
    try {
      const ticket = await client.verifyIdToken({ idToken: String(credential), audience: env.googleClientId });
      const p = ticket.getPayload();
      if (!p?.sub || !p.email) throw new Error('payload incompleto');
      if (!p.email_verified) throw new HttpError(401, 'O e-mail da conta Google não está verificado.');
      return { sub: p.sub, email: p.email.toLowerCase(), name: p.name || p.email.split('@')[0], picture: p.picture ?? null };
    } catch (e) {
      if (e instanceof HttpError) throw e;
      throw new HttpError(401, 'Não foi possível validar o login com o Google.');
    }
  },
};
