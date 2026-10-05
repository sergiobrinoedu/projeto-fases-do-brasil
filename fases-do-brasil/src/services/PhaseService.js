import { Phase } from '@/domain/Phase.js';
import { Period } from '@/domain/Period.js';

/**
 * Serviço de aplicação. Tenta o repositório primário (API) e, se falhar,
 * usa o repositório de fallback (dados locais) — o site funciona sem backend.
 */
export class PhaseService {
  #cache = null;

  constructor(primary, fallback) {
    this.primary = primary;
    this.fallback = fallback;
  }

  async load() {
    if (this.#cache) return this.#cache;

    let raw, source;
    try {
      raw = await this.primary.fetchAll();
      source = 'api';
      if (!raw?.phases?.length) throw new Error('Resposta vazia');
    } catch {
      raw = await this.fallback.fetchAll();
      source = 'local';
    }

    const periods = raw.periods.map(Period.fromDTO);
    const phases = raw.phases.map(Phase.fromDTO).sort((a, b) => a.order - b.order);
    phases.forEach((p) => periods.find((x) => x.id === p.period)?.phases.push(p));

    this.#cache = { periods, phases, source };
    return this.#cache;
  }
}
