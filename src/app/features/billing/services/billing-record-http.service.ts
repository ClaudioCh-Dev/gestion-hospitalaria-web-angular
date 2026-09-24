import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  BillingFilters,
  BillingRecordResponse,
  BillingSummaryResponse,
  CreateBillingRequest,
} from '../interfaces';

import { PageResponse } from '@shared/models/page.type';
import { BillingRecordService } from './billing-record.service';
import { environment } from '@environments/environment';

@Injectable()
export class BillingRecordHttpService implements BillingRecordService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.api.baseUrl}/billings/crud`;

  findAll(
    page: number = 0,
    size: number = 10,
    filters: BillingFilters = {},
  ): Observable<PageResponse<BillingRecordResponse>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (filters.status) {
      params = params.set('status', filters.status);
    }

    if (filters.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }

    // Spring convierte "1,2,3" en List<Long>
    if (filters.patientIds?.length) {
      params = params.set('patientIds', filters.patientIds.join(','));
    }

    if (filters.sort) {
      params = params.set('sort', filters.sort);
    }

    return this.http.get<PageResponse<BillingRecordResponse>>(
      this.apiUrl,
      { params },
    );
  }

  summary(): Observable<BillingSummaryResponse> {
    return this.http.get<BillingSummaryResponse>(
      `${this.apiUrl}/summary`,
    );
  }

  findByPatientId(
    patientId: number,
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<BillingRecordResponse>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<BillingRecordResponse>>(
      `${this.apiUrl}/patient/${patientId}`,
      { params },
    );
  }

  create(
    request: CreateBillingRequest,
  ): Observable<BillingRecordResponse> {
    return this.http.post<BillingRecordResponse>(
      this.apiUrl,
      request,
    );
  }

  pay(id: number): Observable<BillingRecordResponse> {
    return this.http.patch<BillingRecordResponse>(
      `${this.apiUrl}/${id}/pay`,
      {},
    );
  }
}