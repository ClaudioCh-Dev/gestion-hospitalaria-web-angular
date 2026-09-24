// GET /medical-records/crud/summary
export interface MedicalRecordSummaryResponse {
  totalRecords: number;
  uniquePatients: number;
  completedRecords: number;
  totalAmount: number;
  specialties: string[];
}
