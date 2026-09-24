export type CsvValue = string | number | boolean | null | undefined;

// Escapa comillas y envuelve cada valor para que comas o saltos de línea no rompan columnas
function escapeCsv(value: CsvValue): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

// Genera un CSV y lo descarga en el navegador. El BOM hace que Excel respete las tildes.
export function downloadCsv(
  fileName: string,
  header: readonly string[],
  rows: readonly (readonly CsvValue[])[],
): void {
  const csv = [header, ...rows]
    .map((row) => row.map(escapeCsv).join(','))
    .join('\n');

  const url = URL.createObjectURL(
    new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }),
  );

  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}
