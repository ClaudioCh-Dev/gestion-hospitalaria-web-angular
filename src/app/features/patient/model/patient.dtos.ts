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

export interface PatientDetailResponse {
  id: number;
  documentNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  bloodType?: string;
  allergies?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  photo?: string;
}