import { AppointmentStatus } from '../../appointment/interfaces';

// Valores tal cual los envía notification-ms (NotificationType)
export const NotificationType = {
  APPOINTMENT_SCHEDULED: 'APPOINTMENT_SCHEDULED',
  APPOINTMENT_CONFIRMED: 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_COMPLETED: 'APPOINTMENT_COMPLETED',
  APPOINTMENT_CANCELLED: 'APPOINTMENT_CANCELLED',
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

/**
 * Misma forma en GET /notifications/crud/me (médico), GET /notifications/crud/admin
 * y en cada evento "notification" del stream SSE.
 */
export interface NotificationResponse {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  referenceType: string;
  // Id de la cita
  referenceId: number;
  doctorId: number | null;
  patientName: string | null;
  doctorName: string | null;
  specialty: string | null;
  appointmentStatus: AppointmentStatus | null;
  reason: string | null;
  scheduledAt: string | null;
  // Leída por el usuario autenticado (en el stream llega siempre en false)
  read: boolean;
  createdAt: string;
}
