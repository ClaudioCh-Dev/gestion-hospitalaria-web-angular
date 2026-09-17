import { Observable } from 'rxjs';

import {
  AppointmentTypeResponse,
  CreateAppointmentTypeRequest,
  UpdateAppointmentTypeRequest,
} from '../interfaces';

export abstract class AppointmentTypeService {

  abstract findAll(): Observable<AppointmentTypeResponse[]>;

  abstract findById(
    id: number,
  ): Observable<AppointmentTypeResponse>;

  abstract create(
    request: CreateAppointmentTypeRequest,
  ): Observable<AppointmentTypeResponse>;

  abstract update(
    id: number,
    request: UpdateAppointmentTypeRequest,
  ): Observable<AppointmentTypeResponse>;

  abstract deactivate(
    id: number,
  ): Observable<void>;
}