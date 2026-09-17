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