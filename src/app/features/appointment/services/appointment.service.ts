import { Observable } from 'rxjs';

import {
  AppointmentResponse,
  CreateAppointmentRequest,
  UpdateAppointmentStatusRequest,
} from '../interfaces';

import { PageResponse } from '@shared/models/page.type';

export abstract class AppointmentService {

  abstract findAll(
    page?: number,
    size?: number,
  ): Observable<PageResponse<AppointmentResponse>>;

  abstract findById(
    id: number,
  ): Observable<AppointmentResponse>;

  abstract findByPatient(
    patientId: number,
  ): Observable<AppointmentResponse[]>;

  abstract findByDoctor(
    doctorId: number,
  ): Observable<AppointmentResponse[]>;

  abstract findByDate(
    date: string,
  ): Observable<AppointmentResponse[]>;

  abstract create(
    appointment: CreateAppointmentRequest,
  ): Observable<AppointmentResponse>;

  abstract updateStatus(
    id: number,
    request: UpdateAppointmentStatusRequest,
  ): Observable<AppointmentResponse>;

  abstract cancel(
    id: number,
  ): Observable<void>;
}