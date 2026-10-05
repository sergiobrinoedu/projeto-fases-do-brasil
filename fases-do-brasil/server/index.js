import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PERIODS, PHASES, SITE } from '../src/infra/data/phases.data.js';

const app = express();
const PORT = process.env.PORT || 3001;
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');

app.use(cors());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/periods', (_req, res) => res.json(PERIODS));
app.get('/api/phases', (_req, res) => res.json(PHASES));
app.get('/api/phases/:id', (req, res) => {
  const phase = PHASES.find((p) => p.id === req.params.id);
  return phase ? res.json(phase) : res.status(404).json({ error: 'Fase não encontrada' });
});
app.get('/api/timeline', (_req, res) => res.json({ periods: PERIODS, phases: PHASES }));
app.get('/api/site', (_req, res) => res.json(SITE));

// Em produção (npm start) serve também o front-end compilado.
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => console.log(`API Fases do Brasil em http://localhost:${PORT}`));
