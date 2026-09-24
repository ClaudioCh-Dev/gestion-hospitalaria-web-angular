import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { MedicalRecordResponse } from '../interfaces/medical-record-response';
import { MedicalRecordFilters } from '../interfaces/medical-record-filters';
import { MedicalRecordSummaryResponse } from '../interfaces/medical-record-summary-response';
import { PageResponse } from '@shared/models/page.type';

import { MedicalRecordService } from './medical-record.service';
import { environment } from '@environments/environment';

@Injectable()
export class MedicalRecordHttpService
  implements MedicalRecordService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.api.baseUrl}/medical-records/crud`;

  findAll(
    page: number = 0,
    size: number = 10,
    filters: MedicalRecordFilters = {},
  ): Observable<PageResponse<MedicalRecordResponse>> {

    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (filters.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }

    if (filters.specialty) {
      params = params.set('specialty', filters.specialty);
    }

    return this.http.get<PageResponse<MedicalRecordResponse>>(
      this.apiUrl,
      { params },
    );
  }

  summary(): Observable<MedicalRecordSummaryResponse> {
    return this.http.get<MedicalRecordSummaryResponse>(
      `${this.apiUrl}/summary`,
    );
  }

  findByPatientId(
    patientId: number,
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<MedicalRecordResponse>> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<MedicalRecordResponse>>(
      `${this.apiUrl}/patient/${patientId}`,
      { params },
    );
  }
}