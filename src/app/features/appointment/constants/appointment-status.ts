import { AppointmentStatus } from '../interfaces';

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: 'Programada',
  [AppointmentStatus.CONFIRMED]: 'Confirmada',
  [AppointmentStatus.COMPLETED]: 'Completada',
  [AppointmentStatus.CANCELLED]: 'Cancelada',
};

// Apariencias de tuiBadge
export const APPOINTMENT_STATUS_APPEARANCES: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: 'info',
  [AppointmentStatus.CONFIRMED]: 'positive',
  [AppointmentStatus.COMPLETED]: 'neutral',
  [AppointmentStatus.CANCELLED]: 'negative',
};
