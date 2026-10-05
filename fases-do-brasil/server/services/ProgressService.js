import { PhaseModel } from '../models/PhaseModel.js';
import { ProgressModel } from '../models/ProgressModel.js';
import { HttpError } from './HttpError.js';

export const ProgressService = {
  get: (userId) => ProgressModel.get(userId),

  async save(userId, body) {
    const ids = await PhaseModel.ids();
    if (!Array.isArray(body?.read)) throw new HttpError(422, 'Progresso inválido.');
    const read = [...new Set(body.read.filter((id) => ids.includes(id)))];
    const current = body.current === null ? null : Number(body.current);
    if (current !== null && !(Number.isInteger(current) && current >= 0 && current < ids.length)) throw new HttpError(422, 'Fase atual inválida.');
    await ProgressModel.save(userId, { read, current });
    return { read, current };
  },
};
