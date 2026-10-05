/**
 * Roteador SPA (History API) — URLs limpas: /, /sobre, /equipe, /fase/:id.
 * Links internos usam <a href="/rota" data-link>.
 */
export class Router {
  #routes = [];
  #notFound = () => {};

  add(pattern, handler) {
    const keys = [];
    const source = pattern.replace(/:([A-Za-z]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; });
    this.#routes.push({ re: new RegExp(`^${source}/?$`), keys, handler });
    return this;
  }

  fallback(handler) {
    this.#notFound = handler;
    return this;
  }

  start() {
    window.addEventListener('popstate', () => this.#resolve());
    document.addEventListener('click', (e) => {
      const a = e.target.closest?.('a[data-link]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      this.navigate(a.getAttribute('href'));
    });
    this.#resolve();
  }

  /** Navega e executa a rota. */
  navigate(path, { replace = false } = {}) {
    if (path !== location.pathname) history[replace ? 'replaceState' : 'pushState'](null, '', path);
    this.#resolve();
  }

  /** Apenas atualiza a URL (sem executar a rota): usado quando o estado já mudou na tela. */
  sync(path, { replace = false } = {}) {
    if (path === location.pathname) return;
    history[replace ? 'replaceState' : 'pushState'](null, '', path);
  }

  #resolve() {
    const path = location.pathname.replace(/\/{2,}/g, '/') || '/';
    for (const { re, keys, handler } of this.#routes) {
      const m = path.match(re);
      if (m) {
        const params = Object.fromEntries(keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
        return handler({ params, path });
      }
    }
    return this.#notFound({ path });
  }
}
