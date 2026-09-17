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