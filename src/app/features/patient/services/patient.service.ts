import {Observable} from 'rxjs';

import {
  PageResponse,
  PatientRequest,
  PatientResponse,
} from '../model/patient.dtos';

export abstract class PatientService {

  abstract findAll(
    page?: number,
    size?: number,
  ): Observable<PageResponse<PatientResponse>>;

  abstract findById(
    id: number,
  ): Observable<PatientResponse>;

  abstract findByDocumentNumber(
    documentNumber: string,
  ): Observable<PatientResponse>;

  abstract create(
    patient: PatientRequest,
  ): Observable<PatientResponse>;

  abstract update(
    id: number,
    patient: PatientRequest,
  ): Observable<PatientResponse>;

  abstract delete(
    id: number,
  ): Observable<void>;
}