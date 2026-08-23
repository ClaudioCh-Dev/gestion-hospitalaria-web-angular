import {Observable} from 'rxjs';

import { PageResponse } from '../../../shared/models/page.type';
import {PatientDetailResponse, PatientRequest, PatientResponse} from '../model/patient.dtos';

export abstract class PatientService {

  abstract findAll(
    page?: number,
    size?: number,
  ): Observable<PageResponse<PatientResponse>>;

  abstract findById(
    id: number,
  ): Observable<PatientDetailResponse>;

  abstract findByDocumentNumber(
    documentNumber: string,
  ): Observable<PatientDetailResponse>;

  abstract create(
    patient: PatientRequest,
  ): Observable<PatientDetailResponse>;

  abstract update(
    id: number,
    patient: PatientRequest,
  ): Observable<PatientDetailResponse>;

  abstract delete(
    id: number,
  ): Observable<void>;
}