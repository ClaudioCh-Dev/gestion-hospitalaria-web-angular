export interface PatientResponse {
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

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}