import { bus } from '@/infra/EventBus.js';
import { cookies } from '@/infra/cookies.js';

export const PROGRESS_COOKIE = 'fdb_progress';

/**
 * Espelha o progresso em cookie, além do localStorage: se o navegador limpar um dos dois
 * (ou o storage estiver bloqueado), a leitura do visitante sem conta continua guardada.
 */
export function mirrorProgressToCookie(progress) {
  const write = () => {
    const snap = progress.snapshot;
    if (!snap.read.length && snap.current === 0) cookies.remove(PROGRESS_COOKIE);
    else cookies.set(PROGRESS_COOKIE, JSON.stringify(snap));
  };
  bus.on('progress:changed', write);
  bus.on('timeline:loaded', write);
}
