import { Observable } from 'rxjs';

import { PageResponse } from '@shared/models/page.type';
import { MedicalRecordResponse } from '../interfaces/medical-record-response';

export abstract class MedicalRecordService {

  abstract findAll(
    page?: number,
    size?: number,
  ): Observable<PageResponse<MedicalRecordResponse>>;

  abstract findByPatientId(
    patientId: number,
    page?: number,
    size?: number,
  ): Observable<PageResponse<MedicalRecordResponse>>;
}