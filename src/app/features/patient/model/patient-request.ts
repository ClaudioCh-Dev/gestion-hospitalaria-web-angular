export interface PatientRequest{
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  bloodType?: string;
  allergies?: string;
}
