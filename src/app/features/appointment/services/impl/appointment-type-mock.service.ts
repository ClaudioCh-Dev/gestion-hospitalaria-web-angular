import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import {
  AppointmentTypeResponse,
  CreateAppointmentTypeRequest,
  UpdateAppointmentTypeRequest,
} from '../../interfaces';

import { AppointmentTypeService } from '../appointment-type.service';
import { APPOINTMENT_TYPES_MOCK } from '../../mocks';

import { ErrorHandlerService } from '@core/services/error-handler.service';
import { BillingTariffService } from '../../../billing/services/billing-tariff.service';
import { ProblemDetailMicroservice } from '@shared/models/problem.type';

@Injectable()
export class AppointmentTypeMockService
  extends AppointmentTypeService {

  private readonly errorHandler = inject(ErrorHandlerService);

  // Simula el evento appointment-created-type que billing-ms consume para crear la tarifa
  private readonly tariffService = inject(BillingTariffService);

  private readonly MOCK_DELAY = 1500;

  private readonly _appointmentTypes =
    signal<AppointmentTypeResponse[]>(
      structuredClone(APPOINTMENT_TYPES_MOCK),
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

  findAll(): Observable<AppointmentTypeResponse[]> {

    return of(this._appointmentTypes()).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  // =====================================================
  // FIND BY ID
  // =====================================================

  findById(
    id: number,
  ): Observable<AppointmentTypeResponse> {

    const appointmentType = this._appointmentTypes()
      .find(item => item.id === id);

    if (!appointmentType) {
      return this.handleError(
        404,
        'Tipo de cita no encontrado',
        `Tipo de cita ${id} no encontrado`,
        'APPOINTMENT_TYPE_NOT_FOUND',
      );
    }

    return of(appointmentType).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  // =====================================================
  // CREATE
  // =====================================================

  create(
    request: CreateAppointmentTypeRequest,
  ): Observable<AppointmentTypeResponse> {

    const titleExists = this._appointmentTypes()
      .some(
        item =>
          item.title.toLowerCase() ===
          request.title.toLowerCase(),
      );

    if (titleExists) {
      return this.handleError(
        409,
        'Tipo de cita ya existe',
        `El tipo de cita "${request.title}" ya está registrado`,
        'APPOINTMENT_TYPE_EXISTS',
      );
    }

    const id = Date.now();

    const newAppointmentType: AppointmentTypeResponse = {
      id,
      title: request.title,
      description: request.description,
      active: true,
      color: request.color,
    };

    this._appointmentTypes.update(current => [
      ...current,
      newAppointmentType,
    ]);

    this.tariffService
      .create({
        appointmentTypeId: id,
        price: request.price,
        currency: 'PEN',
      })
      .subscribe();

    return of(newAppointmentType).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  // =====================================================
  // UPDATE
  // =====================================================

  update(
    id: number,
    request: UpdateAppointmentTypeRequest,
  ): Observable<AppointmentTypeResponse> {

    const existing = this._appointmentTypes()
      .find(item => item.id === id);

    if (!existing) {
      return this.handleError(
        404,
        'Tipo de cita no encontrado',
        `Tipo de cita ${id} no encontrado`,
        'APPOINTMENT_TYPE_NOT_FOUND',
      );
    }

    const titleExists = this._appointmentTypes()
      .some(
        item =>
          item.id !== id &&
          item.title.toLowerCase() ===
            request.title.toLowerCase(),
      );

    if (titleExists) {
      return this.handleError(
        409,
        'Tipo de cita ya existe',
        `El tipo de cita "${request.title}" ya está registrado`,
        'APPOINTMENT_TYPE_EXISTS',
      );
    }

    const updatedAppointmentType: AppointmentTypeResponse = {
      ...existing,
      title: request.title,
      description: request.description,
      active: request.active,
      color: request.color,
    };

    this._appointmentTypes.update(current =>
      current.map(item =>
        item.id === id
          ? updatedAppointmentType
          : item,
      ),
    );

    return of(updatedAppointmentType).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  // =====================================================
  // DEACTIVATE
  // =====================================================

  deactivate(
    id: number,
  ): Observable<void> {

    const existing = this._appointmentTypes()
      .find(item => item.id === id);

    if (!existing) {
      return this.handleError(
        404,
        'Tipo de cita no encontrado',
        `Tipo de cita ${id} no encontrado`,
        'APPOINTMENT_TYPE_NOT_FOUND',
      );
    }

    this._appointmentTypes.update(current =>
      current.map(item =>
        item.id === id
          ? {
              ...item,
              active: false,
            }
          : item,
      ),
    );

    return of(void 0).pipe(
      delay(this.MOCK_DELAY),
    );
  }
}