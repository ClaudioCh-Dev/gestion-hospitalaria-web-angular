import { AppointmentTypeResponse } from '../interfaces';

export const APPOINTMENT_TYPES_MOCK: AppointmentTypeResponse[] = [
  {
    id: 1,
    title: 'Consulta general',
    description: 'Consulta médica general.',
    active: true,
  },
  {
    id: 2,
    title: 'Consulta especializada',
    description: 'Consulta con un médico especialista.',
    active: true,
  },
  {
    id: 3,
    title: 'Control médico',
    description: 'Control y seguimiento del paciente.',
    active: true,
  },
  {
    id: 4,
    title: 'Evaluación preventiva',
    description: 'Evaluación médica preventiva.',
    active: true,
  },
  {
    id: 5,
    title: 'Consulta de seguimiento',
    description: 'Seguimiento de tratamiento médico.',
    active: false,
  },
];