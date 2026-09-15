import { Observable } from 'rxjs';
import { PageResponse } from '@shared/models/page.type';
import { Gender, PatientDetailResponse, PatientRequest, PatientResponse } from '../model';

export abstract class PatientService {
  abstract findAll(
    page?: number,
    size?: number,
    gender?: Gender,
  ): Observable<PageResponse<PatientResponse>>;

  abstract findById(id: number): Observable<PatientDetailResponse>;

  abstract findByDocumentNumber(documentNumber: string): Observable<PatientResponse>;

  abstract create(patient: PatientRequest): Observable<PatientResponse>;

  abstract update(id: number, patient: PatientRequest): Observable<PatientResponse>;

  abstract delete(id: number): Observable<void>;
}
