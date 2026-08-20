// Specialty
export interface SpecialtyResponse {
  id: number;
  name: string;
  description: string;
}

// Create Specialty
export interface CreateSpecialtyRequest {
  name: string;
  description: string;
}

// Create Doctor
export interface CreateDoctorRequest {
  licenseNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  specialtyId: number;
  scheduleStart?: string; // HH:mm:ss
  scheduleEnd?: string;   // HH:mm:ss
}

// Update Doctor
export interface UpdateDoctorRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  specialtyId: number;
  scheduleStart?: string; // HH:mm:ss
  scheduleEnd?: string;   // HH:mm:ss
  active?: boolean;
}

// Doctor Response
export interface DoctorResponse {
  id: number;
  licenseNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  specialty: SpecialtyResponse;
  scheduleStart?: string; // HH:mm:ss
  scheduleEnd?: string;   // HH:mm:ss
  active: boolean;
  createdAt: string; // ISO 8601
}