import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  BillingRecordResponse,
  CreateBillingRequest,
} from '../interfaces';

import { PageResponse } from '@shared/models/page.type';
import { BillingRecordService } from './billing-record.service';
import { environment } from '@environments/environment';

@Injectable()
export class BillingRecordHttpService implements BillingRecordService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.api.baseUrl}/billing/crud`;

  findAll(
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<BillingRecordResponse>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<BillingRecordResponse>>(
      this.apiUrl,
      { params },
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