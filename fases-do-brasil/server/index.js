import { createApp } from './app.js';
import { env } from './config/env.js';

createApp().listen(env.port, () => {
  console.log(`API Fases do Brasil em http://localhost:${env.port}`);
});
