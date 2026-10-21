import 'dotenv/config';

export const env = Object.freeze({
  port: Number(process.env.PORT) || 3001,
  isProd: process.env.NODE_ENV === 'production',
});
