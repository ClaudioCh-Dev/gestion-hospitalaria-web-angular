export interface MedicalRecordResponse {
  id: string;
  appointmentId: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  specialty: string;
  scheduledAt: string;
  reason: string;
  status: string;
  amount: number;
}