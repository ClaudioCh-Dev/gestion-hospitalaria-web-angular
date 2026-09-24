import { Observable } from 'rxjs';

import { PageResponse } from '@shared/models/page.type';
import { MedicalRecordResponse } from '../interfaces/medical-record-response';
import { MedicalRecordFilters } from '../interfaces/medical-record-filters';
import { MedicalRecordSummaryResponse } from '../interfaces/medical-record-summary-response';

export abstract class MedicalRecordService {

  abstract findAll(
    page?: number,
    size?: number,
    filters?: MedicalRecordFilters,
  ): Observable<PageResponse<MedicalRecordResponse>>;

  abstract summary(): Observable<MedicalRecordSummaryResponse>;

  abstract findByPatientId(
    patientId: number,
    page?: number,
    size?: number,
  ): Observable<PageResponse<MedicalRecordResponse>>;
}