import { EMPTY, Observable, expand, map, reduce } from 'rxjs';

import { PageResponse } from '@shared/models/page.type';

// Página usada al recorrer un listado completo (p. ej. para exportar)
const DEFAULT_PAGE_SIZE = 100;

// Pide la página 0, luego la 1, la 2... hasta la última y devuelve todos los elementos juntos
export function fetchAllPages<T>(
  loadPage: (page: number, size: number) => Observable<PageResponse<T>>,
  size: number = DEFAULT_PAGE_SIZE,
): Observable<T[]> {
  return loadPage(0, size).pipe(
    expand((page) => (page.last ? EMPTY : loadPage(page.number + 1, size))),
    map((page) => page.content),
    reduce((all, content) => [...all, ...content], [] as T[]),
  );
}
