// Valores tal cual los envía patient-ms; el tipo es la unión de esos literales
export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];
