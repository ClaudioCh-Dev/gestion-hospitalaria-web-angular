import { Injectable, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import {
  BillingTariffResponse,
  CreateBillingTariffRequest,
  UpdateBillingTariffRequest,
} from '../interfaces';

import { BILLING_TARIFFS_MOCK } from '../mocks/billing-tariff.mocks';
import { BillingTariffService } from './billing-tariff.service';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { ProblemDetailMicroservice } from '@shared/models/problem.type';

@Injectable()
export class BillingTariffMockService extends BillingTariffService {
  private readonly errorHandler = inject(ErrorHandlerService);

  private readonly MOCK_DELAY = 800;

  private readonly _tariffs = signal<BillingTariffResponse[]>(
    structuredClone(BILLING_TARIFFS_MOCK),
  );

  findAll(): Observable<BillingTariffResponse[]> {
    return of(this._tariffs()).pipe(delay(this.MOCK_DELAY));
  }

  findByAppointmentTypeId(
    appointmentTypeId: number,
  ): Observable<BillingTariffResponse> {
    const tariff = this.find(appointmentTypeId);

    if (!tariff) {
      return this.notFound(appointmentTypeId);
    }

    return of(tariff).pipe(delay(this.MOCK_DELAY));
  }

  create(
    request: CreateBillingTariffRequest,
  ): Observable<BillingTariffResponse> {
    if (this.find(request.appointmentTypeId)) {
      return this.handleError(
        409,
        'Tarifa duplicada',
        'Ya existe una tarifa para este tipo de cita.',
        'TARIFF_ALREADY_EXISTS',
      );
    }

    const tariff: BillingTariffResponse = { ...request };

    this._tariffs.update((tariffs) => [...tariffs, tariff]);

    return of(tariff).pipe(delay(this.MOCK_DELAY));
  }

  update(
    appointmentTypeId: number,
    request: UpdateBillingTariffRequest,
  ): Observable<BillingTariffResponse> {
    if (!this.find(appointmentTypeId)) {
      return this.notFound(appointmentTypeId);
    }

    const updated: BillingTariffResponse = {
      appointmentTypeId,
      ...request,
    };

    this._tariffs.update((tariffs) =>
      tariffs.map((tariff) =>
        tariff.appointmentTypeId === appointmentTypeId ? updated : tariff,
      ),
    );

    return of(updated).pipe(delay(this.MOCK_DELAY));
  }

  private find(appointmentTypeId: number): BillingTariffResponse | undefined {
    return this._tariffs().find(
      (tariff) => tariff.appointmentTypeId === appointmentTypeId,
    );
  }

  private notFound(appointmentTypeId: number): Observable<never> {
    return this.handleError(
      404,
      'Tarifa no encontrada',
      `No existe tarifa para el tipo de cita ${appointmentTypeId}.`,
      'TARIFF_NOT_FOUND',
    );
  }

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
}
