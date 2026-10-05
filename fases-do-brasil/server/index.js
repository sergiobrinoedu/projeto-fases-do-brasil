import { createApp } from './app.js';
import { env } from './config/env.js';
import { SessionModel } from './models/SessionModel.js';

createApp().listen(env.port, () => {
  console.log(`API Fases do Brasil em http://localhost:${env.port}`);
  if (!env.googleClientId) console.log('• Login com Google desativado: defina GOOGLE_CLIENT_ID no .env');
});
SessionModel.purgeExpired().catch(() => { /* banco ainda não disponível */ });
