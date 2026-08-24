import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  PatientDetailResponse,
  PatientRequest,
  PatientResponse,
} from '../model';

import { PageResponse } from '@shared/models/page.type';
import { PatientService } from '@patients/services/patient.service';
import { environment } from '@environments/environment'; 

@Injectable()
export class PatientHttpService implements PatientService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =`${environment.api.baseUrl}/patients`;

  findAll(
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<PatientResponse>> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<PatientResponse>>(
      this.apiUrl,
      { params },
    );
  }

  findById(
    id: number,
  ): Observable<PatientDetailResponse> {

    return this.http.get<PatientDetailResponse>(
      `${this.apiUrl}/${id}`,
    );
  }

  findByDocumentNumber(
    documentNumber: string,
  ): Observable<PatientResponse> {

    return this.http.get<PatientResponse>(
      `${this.apiUrl}/document/${documentNumber}`,
    );
  }

  create(
    patient: PatientRequest,
  ): Observable<PatientResponse> {

    return this.http.post<PatientResponse>(
      this.apiUrl,
      patient,
    );
  }

  update(
    id: number,
    patient: PatientRequest,
  ): Observable<PatientResponse> {

    return this.http.put<PatientResponse>(
      `${this.apiUrl}/${id}`,
      patient,
    );
  }

  delete(
    id: number,
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
    );
  }
}