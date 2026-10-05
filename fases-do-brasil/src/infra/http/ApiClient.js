import $ from 'jquery';
import { config } from '@/infra/config.js';
import { session } from '@/auth/Session.js';

/** Cliente HTTP (jQuery.ajax) com timeout e token de sessão opcional. */
export class ApiClient {
  constructor(base = config.apiBase) {
    this.base = base;
  }

  get(path) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${this.base}${path}`,
        method: 'GET',
        dataType: 'json',
        timeout: config.apiTimeoutMs,
        headers: session.token ? { Authorization: `Bearer ${session.token}` } : {},
      }).then(resolve, (xhr, status) => reject(new Error(`API ${status} (${xhr.status})`)));
    });
  }
}
