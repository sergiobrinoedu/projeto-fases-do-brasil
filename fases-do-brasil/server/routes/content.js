import { Router } from 'express';
import { SITE } from '../../src/infra/data/phases.data.js';
import { PhaseService } from '../services/PhaseService.js';

export const contentRouter = Router();
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

contentRouter.get('/health', (_req, res) => res.json({ status: 'ok' }));
contentRouter.get('/periods', wrap(async (_req, res) => res.json((await PhaseService.timeline()).periods)));
contentRouter.get('/phases', wrap(async (_req, res) => res.json((await PhaseService.timeline()).phases)));
contentRouter.get('/phases/:id', wrap(async (req, res) => {
  const p = await PhaseService.phase(req.params.id);
  return p ? res.json(p) : res.status(404).json({ error: 'Fase não encontrada' });
}));
contentRouter.get('/timeline', wrap(async (_req, res) => {
  const { periods, phases, source } = await PhaseService.timeline();
  res.json({ periods, phases, source });
}));
contentRouter.get('/site', (_req, res) => res.json(SITE));
