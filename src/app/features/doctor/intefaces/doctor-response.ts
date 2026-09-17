import { SpecialtyResponse } from "./specialty-response";

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
  photoUrl?: string;
}