import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  AppointmentTypeResponse,
  CreateAppointmentTypeRequest,
  UpdateAppointmentTypeRequest,
} from '../../interfaces';

import { AppointmentTypeService } from '../appointment-type.service';
import { environment } from '@environments/environment';

@Injectable()
export class AppointmentTypeHttpService
  implements AppointmentTypeService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.api.baseUrl}/appointments/appointment-types`;

  findAll(): Observable<AppointmentTypeResponse[]> {

    return this.http.get<AppointmentTypeResponse[]>(
      this.apiUrl,
    );
  }

  findById(
    id: number,
  ): Observable<AppointmentTypeResponse> {

    return this.http.get<AppointmentTypeResponse>(
      `${this.apiUrl}/${id}`,
    );
  }

  create(
    request: CreateAppointmentTypeRequest,
  ): Observable<AppointmentTypeResponse> {

    return this.http.post<AppointmentTypeResponse>(
      this.apiUrl,
      request,
    );
  }

  update(
    id: number,
    request: UpdateAppointmentTypeRequest,
  ): Observable<AppointmentTypeResponse> {

    return this.http.put<AppointmentTypeResponse>(
      `${this.apiUrl}/${id}`,
      request,
    );
  }

  deactivate(
    id: number,
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
    );
  }
}