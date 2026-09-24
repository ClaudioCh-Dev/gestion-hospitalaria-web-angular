import {
  AppointmentResponse,
  AppointmentStatus,
} from '../interfaces';

export const APPOINTMENTS_MOCK: AppointmentResponse[] = [
  {
    id: 1,
    patientId: 1,
    doctorId: 2,
    scheduledAt: '2026-09-16T09:00:00',
    durationMinutes: 30,
    reason: 'Control general',
    status: AppointmentStatus.CONFIRMED,
    notes: 'Paciente con cita de control.',
    createdAt: '2026-09-10T14:30:00',
  },

  {
    id: 2,
    patientId: 2,
    doctorId: 2,
    scheduledAt: '2026-09-16T10:00:00',
    durationMinutes: 45,
    reason: 'Dolor de cabeza',
    status: AppointmentStatus.SCHEDULED,
    notes: 'Evaluar síntomas y antecedentes.',
    createdAt: '2026-09-11T09:15:00',
  },

  {
    id: 3,
    patientId: 3,
    doctorId: 3,
    scheduledAt: '2026-09-16T11:30:00',
    durationMinutes: 30,
    reason: 'Consulta médica',
    status: AppointmentStatus.COMPLETED,
    notes: 'Consulta realizada correctamente.',
    createdAt: '2026-09-12T16:20:00',
  },

  {
    id: 4,
    patientId: 1,
    doctorId: 3,
    scheduledAt: '2026-09-17T09:30:00',
    durationMinutes: 30,
    reason: 'Seguimiento',
    status: AppointmentStatus.SCHEDULED,
    notes: 'Seguimiento de tratamiento.',
    createdAt: '2026-09-13T11:00:00',
  },

  {
    id: 5,
    patientId: 4,
    doctorId: 2,
    scheduledAt: '2026-09-17T10:30:00',
    durationMinutes: 60,
    reason: 'Evaluación médica',
    status: AppointmentStatus.CANCELLED,
    notes: 'Paciente canceló la cita.',
    createdAt: '2026-09-13T15:45:00',
  },

  {
    id: 6,
    patientId: 5,
    doctorId: 3,
    scheduledAt: '2026-09-17T12:00:00',
    durationMinutes: 30,
    reason: 'Control de rutina',
    status: AppointmentStatus.CONFIRMED,
    notes: 'Control periódico.',
    createdAt: '2026-09-14T08:30:00',
  },

  // ============================================================
  // 18/09/2026 - DOCTOR 1
  // ============================================================

  {
    id: 7,
    patientId: 6,
    doctorId: 1,
    scheduledAt: '2026-09-18T09:00:00',
    durationMinutes: 30,
    reason: 'Control general',
    status: AppointmentStatus.CONFIRMED,
    notes: 'Control médico de rutina.',
    createdAt: '2026-09-15T09:00:00',
  },

  {
    id: 8,
    patientId: 7,
    doctorId: 1,
    scheduledAt: '2026-09-18T10:30:00',
    durationMinutes: 60,
    reason: 'Evaluación médica',
    status: AppointmentStatus.SCHEDULED,
    notes: 'Evaluación inicial del paciente.',
    createdAt: '2026-09-15T10:20:00',
  },

  {
    id: 9,
    patientId: 8,
    doctorId: 1,
    scheduledAt: '2026-09-18T13:00:00',
    durationMinutes: 30,
    reason: 'Seguimiento',
    status: AppointmentStatus.CONFIRMED,
    notes: 'Seguimiento de tratamiento.',
    createdAt: '2026-09-15T11:30:00',
  },

  {
    id: 10,
    patientId: 9,
    doctorId: 1,
    scheduledAt: '2026-09-18T15:30:00',
    durationMinutes: 60,
    reason: 'Consulta especializada',
    status: AppointmentStatus.SCHEDULED,
    notes: 'Revisión de resultados.',
    createdAt: '2026-09-15T14:00:00',
  },

  // ============================================================
  // 18/09/2026 - DOCTOR 2
  // ============================================================

  {
    id: 11,
    patientId: 10,
    doctorId: 2,
    scheduledAt: '2026-09-18T09:30:00',
    durationMinutes: 30,
    reason: 'Consulta general',
    status: AppointmentStatus.CONFIRMED,
    notes: 'Paciente refiere malestar general.',
    createdAt: '2026-09-15T09:40:00',
  },

  {
    id: 12,
    patientId: 11,
    doctorId: 2,
    scheduledAt: '2026-09-18T11:00:00',
    durationMinutes: 45,
    reason: 'Dolor abdominal',
    status: AppointmentStatus.SCHEDULED,
    notes: 'Evaluar antecedentes y síntomas.',
    createdAt: '2026-09-15T10:30:00',
  },

  {
    id: 13,
    patientId: 12,
    doctorId: 2,
    scheduledAt: '2026-09-18T14:00:00',
    durationMinutes: 30,
    reason: 'Control de presión',
    status: AppointmentStatus.CONFIRMED,
    notes: 'Control periódico de presión arterial.',
    createdAt: '2026-09-15T12:00:00',
  },

  {
    id: 14,
    patientId: 13,
    doctorId: 2,
    scheduledAt: '2026-09-18T16:30:00',
    durationMinutes: 60,
    reason: 'Evaluación cardiológica',
    status: AppointmentStatus.SCHEDULED,
    notes: 'Revisión de estudios anteriores.',
    createdAt: '2026-09-15T13:20:00',
  },

  // ============================================================
  // 18/09/2026 - DOCTOR 3
  // ============================================================

  {
    id: 15,
    patientId: 14,
    doctorId: 3,
    scheduledAt: '2026-09-18T09:00:00',
    durationMinutes: 60,
    reason: 'Consulta especializada',
    status: AppointmentStatus.CONFIRMED,
    notes: 'Evaluación médica completa.',
    createdAt: '2026-09-15T08:30:00',
  },

  {
    id: 16,
    patientId: 15,
    doctorId: 3,
    scheduledAt: '2026-09-18T10:30:00',
    durationMinutes: 30,
    reason: 'Control de rutina',
    status: AppointmentStatus.SCHEDULED,
    notes: 'Control periódico.',
    createdAt: '2026-09-15T09:30:00',
  },

  {
    id: 17,
    patientId: 16,
    doctorId: 3,
    scheduledAt: '2026-09-18T12:00:00',
    durationMinutes: 45,
    reason: 'Seguimiento médico',
    status: AppointmentStatus.CONFIRMED,
    notes: 'Seguimiento de tratamiento.',
    createdAt: '2026-09-15T11:00:00',
  },

  {
    id: 18,
    patientId: 17,
    doctorId: 3,
    scheduledAt: '2026-09-18T15:00:00',
    durationMinutes: 30,
    reason: 'Consulta de control',
    status: AppointmentStatus.SCHEDULED,
    notes: 'Revisión de evolución.',
    createdAt: '2026-09-15T12:30:00',
  },
];