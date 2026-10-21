import { PERIODS, PHASES } from '../../src/infra/data/phases.data.js';
import { PhaseModel } from '../models/PhaseModel.js';

/** Lê as fases do banco; se o MySQL estiver fora do ar, usa o conteúdo estático (a página continua funcionando). */
async function fromDb() {
  const [periods, phases] = await Promise.all([PhaseModel.periods(), PhaseModel.phases()]);
  if (!phases.length) throw new Error('banco sem conteúdo (rode npm run db:init)');
  return { periods, phases, source: 'db' };
}

let warned = false;
export const PhaseService = {
  async timeline() {
    try { return await fromDb(); } catch (e) {
      if (!warned) { warned = true; console.warn(`[fases] usando conteúdo estático: ${e.message}`); }
      return { periods: PERIODS, phases: PHASES, source: 'static' };
    }
  },
  async phase(id) {
    return (await this.timeline()).phases.find((p) => p.id === id) ?? null;
  },
};
