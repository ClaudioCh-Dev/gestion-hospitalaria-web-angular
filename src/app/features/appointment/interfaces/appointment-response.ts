import { AppointmentStatus } from "./appointment-status";

export interface AppointmentResponse {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentTypeId: number;
  scheduledAt: string;
  durationMinutes: number;
  reason: string;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
}