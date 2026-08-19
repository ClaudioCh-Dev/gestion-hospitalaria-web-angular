import { Observable } from 'rxjs';

import {
  PageResponse,
  CreateDoctorRequest,
  UpdateDoctorRequest,
  DoctorResponse,
  CreateSpecialtyRequest,
  SpecialtyResponse,
} from '../model/doctor.dtos';

export abstract class DoctorService {

  abstract findAll(
    page?: number,
    size?: number,
  ): Observable<PageResponse<DoctorResponse>>;

  abstract findById(
    id: number,
  ): Observable<DoctorResponse>;

  abstract findBySpecialty(
    specialtyId: number,
    page?: number,
    size?: number,
  ): Observable<PageResponse<DoctorResponse>>;

  abstract create(
    doctor: CreateDoctorRequest,
  ): Observable<DoctorResponse>;

  abstract update(
    id: number,
    doctor: UpdateDoctorRequest,
  ): Observable<DoctorResponse>;

  abstract findAllSpecialties(
    page?: number,
    size?: number,
  ): Observable<PageResponse<SpecialtyResponse>>;

  abstract createSpecialty(
    specialty: CreateSpecialtyRequest,
  ): Observable<SpecialtyResponse>;
}