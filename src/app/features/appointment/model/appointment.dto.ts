export interface CreateAppointmentRequest {
  patientId: number;
  doctorId: number;
  appointmentTypeId: number;
  scheduledAt: string;
  durationMinutes: number;
  reason?: string;
  notes?: string;
}
export interface AppointmentResponse {
  id: number;
  patientId: number;
  doctorId: number;
  scheduledAt: string;
  durationMinutes: number;
  reason: string;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
}
export interface AppointmentTypeResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  active: boolean;
}
export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED';

  export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
}