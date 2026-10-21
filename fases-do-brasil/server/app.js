import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { contentRouter } from './routes/content.js';
import { jsonOnly } from './middleware/json.js';
import { errorHandler, notFoundApi } from './middleware/errors.js';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '50kb' }));
  app.use(cookieParser()); // cookies do visitante (ex.: fdb_progress) disponíveis em req.cookies

  const api = express.Router();
  api.use(jsonOnly);
  api.use(contentRouter);
  api.use(notFoundApi);
  app.use('/api', api);
  app.use(errorHandler);

  // Em produção (npm start) serve também o front-end compilado.
  if (fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }
  return app;
}
