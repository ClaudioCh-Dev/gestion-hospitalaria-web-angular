// Doctor Response
export interface DoctorResponse {
  id: number;
  licenseNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  userId?: number;
  specialtyId: number;
  specialtyName: string;
  scheduleStart?: string; // HH:mm:ss
  scheduleEnd?: string;   // HH:mm:ss
  active: boolean;
  photoUrl?: string;
}