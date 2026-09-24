import { Observable } from 'rxjs';
import { PageResponse } from '@shared/models/page.type';
import {
  BillingFilters,
  BillingRecordResponse,
  BillingSummaryResponse,
  CreateBillingRequest,
} from '../interfaces';

export abstract class BillingRecordService {
  abstract findAll(
    page?: number,
    size?: number,
    filters?: BillingFilters,
  ): Observable<PageResponse<BillingRecordResponse>>;

  abstract summary(): Observable<BillingSummaryResponse>;

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