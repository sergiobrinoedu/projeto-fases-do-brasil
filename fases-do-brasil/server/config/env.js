import 'dotenv/config';

export const env = Object.freeze({
  port: Number(process.env.PORT) || 3001,
  isProd: process.env.NODE_ENV === 'production',
  googleClientId: process.env.GOOGLE_CLIENT_ID?.trim() || '',
  sessionDays: Number(process.env.SESSION_DAYS) || 7,
  cookieName: 'fdb_sid',
});
