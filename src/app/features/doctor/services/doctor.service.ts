import { Observable } from 'rxjs';

import { PageResponse } from '../../../shared/models/page.type';

import {
  CreateDoctorRequest,
  UpdateDoctorRequest,
  DoctorResponse,
  CreateSpecialtyRequest,
  SpecialtyResponse,
} from '../intefaces';

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

  abstract findAllSpecialties(): Observable<SpecialtyResponse[]>;

  abstract createSpecialty(
    specialty: CreateSpecialtyRequest,
  ): Observable<SpecialtyResponse>;
}