import { Router } from 'express';
import { ProgressService } from '../services/ProgressService.js';
import { requireAuth } from '../middleware/auth.js';

export const progressRouter = Router();
progressRouter.use(requireAuth);
progressRouter.get('/', (req, res, next) => ProgressService.get(req.auth.userId).then((p) => res.json(p), next));
progressRouter.put('/', (req, res, next) => ProgressService.save(req.auth.userId, req.body).then((p) => res.json(p), next));
