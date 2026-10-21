export class HttpError extends Error {
  constructor(status, message, field) { super(message); this.status = status; this.field = field; }
}
