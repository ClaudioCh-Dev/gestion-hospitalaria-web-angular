export interface PatientResponse{
  id: number;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate?: string ;
  gender?: string;
  phone?: string;
  email?: string;
  active: boolean;
  photo?: string;
}