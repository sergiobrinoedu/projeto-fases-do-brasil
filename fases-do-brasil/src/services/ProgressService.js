import { bus } from '@/infra/EventBus.js';

const KEY = 'fdb.progress.v1';

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
      const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
      if (saved) {
        const ids = new Set(phases.map((p) => p.id));
        this.#read = new Set((saved.read ?? []).filter((id) => ids.has(id)));
        this.current = saved.current === null ? null : Math.min(Math.max(0, Number(saved.current) || 0), phases.length - 1);
      }
    } catch { /* sem storage: segue em memória */ }
  }

  #save() {
    try { localStorage.setItem(KEY, JSON.stringify({ read: [...this.#read], current: this.current })); } catch { /* noop */ }
  }

  get total() { return this.phases.length; }
  get readCount() { return this.#read.size; }
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
