export const BLOOD_TYPES = [
  { value: 'A+', id: 'A_POSITIVE' },
  { value: 'A-', id: 'A_NEGATIVE' },
  { value: 'B+', id: 'B_POSITIVE' },
  { value: 'B-', id: 'B_NEGATIVE' },
  { value: 'AB+', id: 'AB_POSITIVE' },
  { value: 'AB-', id: 'AB_NEGATIVE' },
  { value: 'O+', id: 'O_POSITIVE' },
  { value: 'O-', id: 'O_NEGATIVE' },
] as const;

export const GENDERS = [
  { value: 'Masculino', id: 'MALE' },
  { value: 'Femenino', id: 'FEMALE' },
] as const;