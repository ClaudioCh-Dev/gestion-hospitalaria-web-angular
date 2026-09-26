import { AppointmentStatus } from '../../appointment/interfaces';
import { NotificationResponse, NotificationType } from '../interfaces';

// En el backend doctorUserId es una columna que no se expone: aquí se guarda para filtrar "mis notificaciones"
export interface NotificationMock extends NotificationResponse {
  doctorUserId: number | null;
}

// doctor@example.com (userId 2) es el médico 1, Carlos Ramírez (DoctorMockService.findMe)
export const NOTIFICATIONS_MOCK: NotificationMock[] = [
  {
    id: 3,
    type: NotificationType.APPOINTMENT_CONFIRMED,
    title: 'Cita confirmada',
    message: 'La cita de María Gonzales ha sido confirmada.',
    referenceType: 'APPOINTMENT',
    referenceId: 10,
    doctorId: 1,
    doctorUserId: 2,
    patientName: 'María Gonzales',
    doctorName: 'Carlos Ramírez',
    specialty: 'Cardiología',
    appointmentStatus: AppointmentStatus.CONFIRMED,
    reason: 'Dolor de pecho al hacer ejercicio',
    scheduledAt: '2026-10-05T10:30:00',
    read: false,
    createdAt: '2026-09-25T09:10:00',
  },
  {
    id: 2,
    type: NotificationType.APPOINTMENT_SCHEDULED,
    title: 'Cita programada',
    message: 'Se ha creado una nueva cita para Pedro Salas con el doctor Luis Flores',
    referenceType: 'APPOINTMENT',
    referenceId: 11,
    doctorId: 3,
    doctorUserId: null,
    patientName: 'Pedro Salas',
    doctorName: 'Luis Flores',
    specialty: 'Dermatología',
    appointmentStatus: AppointmentStatus.SCHEDULED,
    reason: 'Revisión de lunares',
    scheduledAt: '2026-10-06T15:00:00',
    read: false,
    createdAt: '2026-09-24T17:40:00',
  },
  {
    id: 1,
    type: NotificationType.APPOINTMENT_SCHEDULED,
    title: 'Cita programada',
    message: 'Se ha creado una nueva cita para María Gonzales con el doctor Carlos Ramírez',
    referenceType: 'APPOINTMENT',
    referenceId: 10,
    doctorId: 1,
    doctorUserId: 2,
    patientName: 'María Gonzales',
    doctorName: 'Carlos Ramírez',
    specialty: 'Cardiología',
    appointmentStatus: AppointmentStatus.SCHEDULED,
    reason: 'Dolor de pecho al hacer ejercicio',
    scheduledAt: '2026-10-05T10:30:00',
    read: false,
    createdAt: '2026-09-23T17:45:00',
  },
];

// Lo que "llega" por el stream simulado, en orden (una cada 30 s). Todas son de citas de
// Carlos Ramírez para que las reciban tanto admin@example.com como doctor@example.com.
// scheduledAt null = se calcula al simularla (dentro de 3 días a las 10:00).
export type NotificationMockScenario = Omit<NotificationMock, 'id' | 'read' | 'createdAt'>;

const CARLOS = { doctorId: 1, doctorUserId: 2, doctorName: 'Carlos Ramírez', specialty: 'Cardiología' };

export const NOTIFICATION_MOCK_SCENARIOS: NotificationMockScenario[] = [
  // 1. Se crea una cita nueva
  {
    ...CARLOS,
    type: NotificationType.APPOINTMENT_SCHEDULED,
    title: 'Cita programada',
    message: 'Se ha creado una nueva cita para Rosa Quispe con el doctor Carlos Ramírez',
    referenceType: 'APPOINTMENT',
    referenceId: 20,
    patientName: 'Rosa Quispe',
    appointmentStatus: AppointmentStatus.SCHEDULED,
    reason: 'Control de presión arterial',
    scheduledAt: null,
  },
  // 2. Se confirma esa misma cita
  {
    ...CARLOS,
    type: NotificationType.APPOINTMENT_CONFIRMED,
    title: 'Cita confirmada',
    message: 'La cita de Rosa Quispe ha sido confirmada.',
    referenceType: 'APPOINTMENT',
    referenceId: 20,
    patientName: 'Rosa Quispe',
    appointmentStatus: AppointmentStatus.CONFIRMED,
    reason: 'Control de presión arterial',
    scheduledAt: null,
  },
  // 3. Se cancela la cita de María Gonzales (ya está en NOTIFICATIONS_MOCK)
  {
    ...CARLOS,
    type: NotificationType.APPOINTMENT_CANCELLED,
    title: 'Cita cancelada',
    message: 'La cita de María Gonzales ha sido cancelada.',
    referenceType: 'APPOINTMENT',
    referenceId: 10,
    patientName: 'María Gonzales',
    appointmentStatus: AppointmentStatus.CANCELLED,
    reason: 'Dolor de pecho al hacer ejercicio',
    scheduledAt: '2026-10-05T10:30:00',
  },
];
