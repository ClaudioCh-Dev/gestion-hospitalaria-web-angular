import { PROBLEM_MESSAGES } from './error-map';

export function getProblemMessage(
  code?: string,
  fallback?: string
): string {
  if (!code) {
    return fallback ?? 'Ha ocurrido un error inesperado.';
  }

  return PROBLEM_MESSAGES[code]
    ?? fallback
    ?? 'Ha ocurrido un error inesperado.';
}