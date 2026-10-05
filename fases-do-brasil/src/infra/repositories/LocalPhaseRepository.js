import { PhaseRepository } from '@/domain/PhaseRepository.js';
import { PERIODS, PHASES } from '@/infra/data/phases.data.js';

/** Implementação offline: lê os dados embutidos no bundle. */
export class LocalPhaseRepository extends PhaseRepository {
  async fetchAll() {
    return { periods: PERIODS, phases: PHASES };
  }
}
