import { PhaseRepository } from '@/domain/PhaseRepository.js';
import { ApiClient } from '@/infra/http/ApiClient.js';

/** Implementação que consome a API Node (/api/timeline). */
export class ApiPhaseRepository extends PhaseRepository {
  constructor(client = new ApiClient()) {
    super();
    this.client = client;
  }

  async fetchAll() {
    return this.client.get('/timeline');
  }
}
