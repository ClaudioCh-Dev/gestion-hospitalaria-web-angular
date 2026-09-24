import { HttpErrorResponse } from '@angular/common/http';

import { Injectable, inject, signal } from '@angular/core';

import { Observable, of, throwError } from 'rxjs';

import { delay, map } from 'rxjs/operators';

import {
  AppointmentResponse,
  AppointmentStatus,
  CreateAppointmentRequest,
  UpdateAppointmentStatusRequest,
} from '../../interfaces';

import { AppointmentService } from '../appointment.service';

import { APPOINTMENTS_TODAY_MOCK } from '../../mocks/appointment.mocks';

import { PageResponse } from '@shared/models/page.type';

import { ProblemDetailMicroservice } from '@shared/models/problem.type';

import { ErrorHandlerService } from '@core/services/error-handler.service';

@Injectable()
export class AppointmentMockService extends AppointmentService {

  private readonly errorHandler = inject(ErrorHandlerService);

  private readonly MOCK_DELAY = 1500;

  private readonly _appointments =
    signal<AppointmentResponse[]>(
      structuredClone(APPOINTMENTS_TODAY_MOCK),
    );

  // =====================================================
  // HANDLE ERROR
  // =====================================================

  private handleError(
    status: number,
    title: string,
    detail: string,
    code?: string,
  ): Observable<never> {

    const problem: ProblemDetailMicroservice = {
      type: 'about:blank',
      title,
      status,
      detail,
      instance: undefined,
      code,
    };


    const error = new HttpErrorResponse({
      status,
      statusText: title,
      error: problem,
    });

    this.errorHandler.handle(error);

    return throwError(() => error);
  }

  // =====================================================
  // FIND ALL
  // =====================================================

  findAll(
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<AppointmentResponse>> {

    const appointments = this._appointments();

    const totalElements = appointments.length;

    const totalPages = Math.ceil(totalElements / size);

    const start = page * size;

    const end = start + size;

    const content = appointments.slice(start, end);

    const response: PageResponse<AppointmentResponse> = {
      content,
      totalElements,
      totalPages,
      size,
      number: page,
      first: page === 0,
      last: page >= totalPages - 1,
      numberOfElements: content.length,
    };

    return of(response).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  // =====================================================
  // FIND BY ID
  // =====================================================

  findById(
    id: number,
  ): Observable<AppointmentResponse> {

    const appointment = this._appointments()
      .find(item => item.id === id);

    if (!appointment) {
      return this.handleError(
        404,
        'Cita no encontrada',
        `Cita ${id} no encontrada`,
        'APPOINTMENT_NOT_FOUND',
      );
    }

    return of(appointment).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  // =====================================================
  // FIND BY PATIENT
  // =====================================================

  findByPatient(
    patientId: number,
  ): Observable<AppointmentResponse[]> {

    const appointments = this._appointments()
      .filter(item => item.patientId === patientId);

    return of(appointments).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  // =====================================================
  // FIND BY DOCTOR
  // =====================================================

  findByDoctor(
    doctorId: number,
  ): Observable<AppointmentResponse[]> {

    const appointments = this._appointments()
      .filter(item => item.doctorId === doctorId);

    return of(appointments).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  // =====================================================
  // FIND BY DATE
  // =====================================================

  findByDate(
    date: string,
  ): Observable<AppointmentResponse[]> {

    const appointments = this._appointments()
      .filter(item =>
        item.scheduledAt.startsWith(date),
      );

    return of(appointments).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  // =====================================================
  // CREATE
  // =====================================================

  create(
    request: CreateAppointmentRequest,
  ): Observable<AppointmentResponse> {

    const id = Date.now();

    const newAppointment: AppointmentResponse = {
      id,
      patientId: request.patientId,
      doctorId: request.doctorId,
      appointmentTypeId: request.appointmentTypeId,
      scheduledAt: request.scheduledAt,
      durationMinutes: request.durationMinutes,
      reason: request.reason,
      status: AppointmentStatus.SCHEDULED,
      notes: request.notes,
      createdAt: new Date().toISOString(),
    };
    

    this._appointments.update(current => [
      ...current,
      newAppointment,
    ]);


    return of(newAppointment).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  updateStatus(
    id: number,
    request: UpdateAppointmentStatusRequest,
  ): Observable<AppointmentResponse> {

    const existing = this._appointments()
      .find(item => item.id === id);

    if (!existing) {
      return this.handleError(
        404,
        'Cita no encontrada',
        `Cita ${id} no encontrada`,
        'APPOINTMENT_NOT_FOUND',
      );
    }

    if (existing.status === request.status) {
      return this.handleError(
        409,
        'Estado sin cambios',
        'No se puede cambiar el estado de la cita a el mismo estado',
        'APPOINTMENT_STATUS_ALREADY_SET',
      );
    }

    // Igual que el backend: completada y cancelada son estados finales
    if (
      existing.status === AppointmentStatus.COMPLETED ||
      existing.status === AppointmentStatus.CANCELLED
    ) {
      return this.handleError(
        409,
        'Estado no modificable',
        'No se puede cambiar el estado de una cita completada o cancelada.',
        'APPOINTMENT_STATUS_CANNOT_CHANGE',
      );
    }

    const updatedAppointment: AppointmentResponse = {
      ...existing,
      status: request.status,
    };

    this._appointments.update(current =>
      current.map(item =>
        item.id === id
          ? updatedAppointment
          : item,
      ),
    );

    return of(updatedAppointment).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  // =====================================================
  // CANCEL
  // =====================================================

  cancel(
    id: number,
  ): Observable<void> {

    // Igual que el backend: cancelar es un cambio de estado con las mismas validaciones
    return this.updateStatus(id, {
      status: AppointmentStatus.CANCELLED,
    }).pipe(
      map(() => undefined),
    );
  }
}