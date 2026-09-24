import { BillingStatus } from './billing-status';

// Filtros opcionales de GET /billings/crud
export interface BillingFilters {
  status?: BillingStatus | null;
  // Número de factura, cita o paciente (billing-ms no guarda nombres)
  search?: string | null;
  // Para buscar por nombre: se resuelven antes los IDs en patient-ms
  patientIds?: number[] | null;
  // Formato de Spring: "campo,asc|desc"
  sort?: string | null;
}
