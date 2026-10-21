import $ from 'jquery';
import { config } from '@/infra/config.js';
import { session } from '@/auth/Session.js';

/** Erro padronizado da API: mensagem amigável, status HTTP e (opcional) campo do formulário. */
export class ApiError extends Error {
  constructor(message, status = 0, field = null) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

/** Cliente HTTP (jQuery.ajax) com JSON, timeout, cookies do navegador e token da sessão do visitante. */
export class ApiClient {
  constructor(base = config.apiBase) {
    this.base = base;
  }

  request(method, path, body, timeout = config.apiTimeoutMs) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${this.base}${path}`,
        method,
        dataType: 'json',
        contentType: 'application/json',
        data: body === undefined ? undefined : JSON.stringify(body),
        timeout,
        headers: session.token ? { 'X-Session-Token': session.token } : {},
        xhrFields: { withCredentials: true },
      }).then(resolve, (xhr, status) => {
        const msg = xhr.responseJSON?.error
          ?? (status === 'timeout' ? 'O servidor demorou a responder. Tente de novo.'
            : xhr.status === 0 ? 'Sem conexão com o servidor.' : `Erro ${xhr.status}.`);
        reject(new ApiError(msg, xhr.status, xhr.responseJSON?.field ?? null));
      });
    });
  }

  get(path) { return this.request('GET', path); }
  post(path, body, timeout = config.writeTimeoutMs) { return this.request('POST', path, body ?? {}, timeout); }
  put(path, body) { return this.request('PUT', path, body, config.writeTimeoutMs); }
}
