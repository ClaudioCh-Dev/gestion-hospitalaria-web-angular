import { DestroyRef, Signal, inject, signal } from '@angular/core';

/**
 * Signal con la hora actual que se actualiza al inicio de cada minuto.
 * Debe llamarse en un contexto de inyección (constructor o inicializador de campo);
 * los temporizadores se limpian al destruir el componente.
 */
export function injectNow(): Signal<Date> {
  const destroyRef = inject(DestroyRef);
  const now = signal(new Date());

  let intervalId: ReturnType<typeof setInterval> | undefined;

  // Se alinea con el siguiente minuto exacto y luego actualiza cada 60 s
  const timeoutId = setTimeout(() => {
    now.set(new Date());
    intervalId = setInterval(() => now.set(new Date()), 60_000);
  }, 60_000 - (Date.now() % 60_000));

  destroyRef.onDestroy(() => {
    clearTimeout(timeoutId);
    clearInterval(intervalId);
  });

  return now.asReadonly();
}
