/**
 * Contrato (porta) do Repository Pattern.
 * A camada de serviço depende apenas desta interface;
 * as implementações concretas vivem em infra/repositories.
 */
export class PhaseRepository {
  /** @returns {Promise<{periods: object[], phases: object[]}>} */
  async fetchAll() {
    throw new Error('PhaseRepository.fetchAll() não implementado');
  }
}
