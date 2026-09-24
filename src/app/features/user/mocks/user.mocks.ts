import { RoleResponse, UserResponse } from '../interfaces';

export const ROLES_MOCK: RoleResponse[] = [
  { id: 1, name: 'ADMIN' },
  { id: 2, name: 'DOCTOR' },
];

export const USERS_MOCK: UserResponse[] = [
  { id: 1, email: 'admin@example.com', roleId: 1, role: 'ADMIN', active: true, activationPending: false },
  { id: 2, email: 'doctor@example.com', roleId: 2, role: 'DOCTOR', active: true, activationPending: false },
  { id: 3, email: 'maria.garcia@hospital.com', roleId: 2, role: 'DOCTOR', active: true, activationPending: false },
  { id: 4, email: 'carlos.ramirez@hospital.com', roleId: 2, role: 'DOCTOR', active: false, activationPending: true },
  { id: 5, email: 'recepcion@hospital.com', roleId: 1, role: 'ADMIN', active: false, activationPending: true },
  { id: 6, email: 'luis.torres@hospital.com', roleId: 2, role: 'DOCTOR', active: false, activationPending: false },
];
