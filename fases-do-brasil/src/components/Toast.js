import $ from 'jquery';
import { esc } from '@/infra/escape.js';

/** Aviso temporário (acessível: role=status). type: ok | error | info */
export function toast(message, type = 'ok', ms = 3600) {
  let $box = $('#toasts');
  if (!$box.length) $box = $('<div id="toasts" class="toasts" role="status" aria-live="polite"></div>').appendTo('body');
  const $t = $(`<div class="toast toast--${type}">${esc(message)}</div>`).appendTo($box);
  requestAnimationFrame(() => $t.addClass('is-in'));
  setTimeout(() => { $t.removeClass('is-in'); setTimeout(() => $t.remove(), 400); }, ms);
}
