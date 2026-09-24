// Misma semántica que la búsqueda del backend: sin distinguir mayúsculas y por coincidencia parcial.
// Se usa en los servicios mock para que se comporten igual que los microservicios.
export function matchesSearch(
  search: string | null | undefined,
  ...fields: (string | number | null | undefined)[]
): boolean {
  const term = (search ?? '').trim().toLowerCase();

  if (!term) {
    return true;
  }

  return fields.some((field) =>
    String(field ?? '').toLowerCase().includes(term),
  );
}
