import { HttpError } from '../services/HttpError.js';

/** Mutações só aceitam JSON (bloqueia envio de formulários de outros sites — CSRF). */
export function jsonOnly(req, _res, next) {
  // req.is() é null quando não há corpo; false quando há corpo que não é JSON.
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.is('application/json') === false) {
    return next(new HttpError(415, 'Use application/json.'));
  }
  next();
}
