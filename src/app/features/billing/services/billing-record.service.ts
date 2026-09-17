import { Observable } from 'rxjs';
import { PageResponse } from '@shared/models/page.type';
import {
  BillingRecordResponse,
  CreateBillingRequest,
} from '../interfaces';

export abstract class BillingRecordService {
  abstract findAll(
    page?: number,
    size?: number,
  ): Observable<PageResponse<BillingRecordResponse>>;

  abstract findByPatientId(
    patientId: number,
    page?: number,
    size?: number,
  ): Observable<PageResponse<BillingRecordResponse>>;

  abstract create(
    request: CreateBillingRequest,
  ): Observable<BillingRecordResponse>;

  abstract pay(id: number): Observable<BillingRecordResponse>;
}