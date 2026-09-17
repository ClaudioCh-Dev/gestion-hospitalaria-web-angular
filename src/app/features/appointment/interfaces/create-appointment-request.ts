export interface CreateAppointmentRequest {
  patientId: number;
  doctorId: number;
  appointmentTypeId: number;
  scheduledAt: string;
  durationMinutes: number;
  reason: string;
  notes: string;
}
