// Filtros opcionales de GET /medical-records/crud
export interface MedicalRecordFilters {
  // Paciente, médico, especialidad o motivo
  search?: string | null;
  // Especialidad exacta
  specialty?: string | null;
}
