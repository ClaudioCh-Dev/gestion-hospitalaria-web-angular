import { inject, Injectable } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  AppointmentResponse,
  CreateAppointmentRequest,
  UpdateAppointmentStatusRequest,
} from '../../interfaces';

import { PageResponse } from '@shared/models/page.type';

import { AppointmentService } from '../appointment.service';

import { environment } from '@environments/environment';

@Injectable()
export class AppointmentHttpService implements AppointmentService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.api.baseUrl}/appointments/crud`;

  findAll(
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<AppointmentResponse>> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<PageResponse<AppointmentResponse>>(
      this.apiUrl,
      { params },
    );
  }

  findById(
    id: number,
  ): Observable<AppointmentResponse> {

    return this.http.get<AppointmentResponse>(
      `${this.apiUrl}/${id}`,
    );
  }

  findByPatient(
    patientId: number,
  ): Observable<AppointmentResponse[]> {

    return this.http.get<AppointmentResponse[]>(
      `${this.apiUrl}/patient/${patientId}`,
    );
  }

  findByDoctor(
    doctorId: number,
  ): Observable<AppointmentResponse[]> {

    return this.http.get<AppointmentResponse[]>(
      `${this.apiUrl}/doctor/${doctorId}`,
    );
  }

  findByDate(
    date: string,
  ): Observable<AppointmentResponse[]> {

    return this.http.get<AppointmentResponse[]>(
      `${this.apiUrl}/date/${date}`,
    );
  }

  create(
    appointment: CreateAppointmentRequest,
  ): Observable<AppointmentResponse> {

    return this.http.post<AppointmentResponse>(
      this.apiUrl,
      appointment,
    );
  }

  updateStatus(
    id: number,
    request: UpdateAppointmentStatusRequest,
  ): Observable<AppointmentResponse> {

    return this.http.patch<AppointmentResponse>(
      `${this.apiUrl}/${id}/status`,
      request,
    );
  }

  cancel(
    id: number,
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
    );
  }
}