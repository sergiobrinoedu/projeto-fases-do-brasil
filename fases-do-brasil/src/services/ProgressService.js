import { bus } from '@/infra/EventBus.js';
import { session } from '@/auth/Session.js';
import { ApiClient } from '@/infra/http/ApiClient.js';
import { cookies } from '@/infra/cookies.js';

const KEY = 'fdb.progress.v1';
const COOKIE = 'fdb_progress';

/**
 * Progresso de leitura do aluno (persistido no navegador).
 * - lida   : fase concluída (card esmaecido com a marcação #0e1216)
 * - atual  : fase em que o aluno está ("Você está aqui")
 * - pendente
 */
export class ProgressService {
  #read = new Set();
  phases = [];
  current = 0; // índice da fase atual; null = jornada concluída

  load(phases) {
    this.phases = phases;
    try {
      let raw = null;
      try { raw = localStorage.getItem(KEY); } catch { /* storage bloqueado */ }
      const saved = JSON.parse(raw ?? cookies.get(COOKIE) ?? 'null'); // localStorage primeiro, cookie como reserva
      if (saved) {
        const ids = new Set(phases.map((p) => p.id));
        this.#read = new Set((saved.read ?? []).filter((id) => ids.has(id)));
        this.current = saved.current === null ? null : Math.min(Math.max(0, Number(saved.current) || 0), phases.length - 1);
      }
    } catch { /* sem storage: segue em memória */ }
  }

  #save() {
    try { localStorage.setItem(KEY, JSON.stringify({ read: [...this.#read], current: this.current })); } catch { /* noop */ }
    this.#push();
  }

  /** Envia o progresso ao banco (só com usuário logado); falha de rede não interrompe a leitura. */
  #push() {
    if (!session.isAuthenticated || !this.phases.length) return;
    const ids = this.phases.map((p) => p.id);
    const read = ids.filter((id) => this.#read.has(id));
    this.#api.put('/progress', { read, current: this.current }).catch(() => { /* tenta de novo na próxima ação */ });
  }

  #api = new ApiClient();

  /**
   * Após o login: junta o progresso do banco com o do navegador (união das fases lidas)
   * e salva o resultado nos dois lados.
   */
  async sync() {
    if (!session.isAuthenticated || !this.phases.length) return;
    try {
      const remote = await this.#api.get('/progress');
      const ids = new Set(this.phases.map((p) => p.id));
      remote.read.filter((id) => ids.has(id)).forEach((id) => this.#read.add(id));
      if (remote.current !== undefined) {
        this.current = this.current === null || remote.current === null ? null : Math.max(this.current, remote.current);
      }
      this.#save();
      bus.emit('progress:changed', this);
    } catch { /* offline: segue só com o progresso local */ }
  }

  /** Ao sair da conta: limpa o progresso deste navegador (computadores compartilhados). */
  clearLocal() {
    this.#read.clear();
    this.current = 0;
    try { localStorage.removeItem(KEY); } catch { /* noop */ }
    bus.emit('progress:changed', this);
  }

  get total() { return this.phases.length; }
  get readCount() { return this.#read.size; }
  /** Cópia serializável do progresso (usada para o cookie). */
  get snapshot() { return { read: [...this.#read], current: this.current }; }
  get finished() { return this.current === null; }
  get focusIndex() { return this.current ?? this.phases.length - 1; }

  stateOf(index) {
    if (index === this.current) return 'current';
    return this.#read.has(this.phases[index]?.id) ? 'read' : 'todo';
  }

  /** Aluno concluiu a leitura da fase `index` e segue para a próxima. */
  complete(index) {
    this.#read.add(this.phases[index].id);
    this.current = index + 1 < this.phases.length ? index + 1 : null;
    this.#save();
    bus.emit('progress:changed', this);
  }

  reset() {
    this.#read.clear();
    this.current = 0;
    this.#save();
    bus.emit('progress:changed', this);
  }
}
