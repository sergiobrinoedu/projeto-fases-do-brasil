const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapa texto antes de inseri-lo em templates HTML (dados podem vir da API). */
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => MAP[c]);
