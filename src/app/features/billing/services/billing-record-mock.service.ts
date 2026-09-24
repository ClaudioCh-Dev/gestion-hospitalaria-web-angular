import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import {
  BillingFilters,
  BillingRecordResponse,
  BillingStatus,
  BillingSummaryResponse,
  CreateBillingRequest,
} from '../interfaces';

import { BILLING_RECORDS_MOCK } from '../mocks/billing-record.mocks';
import { BillingRecordService } from './billing-record.service';
import { PageResponse } from '@shared/models/page.type';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { ProblemDetailMicroservice } from '@shared/models/problem.type';

@Injectable()
export class BillingRecordMockService extends BillingRecordService {
  private readonly MOCK_DELAY = 1500;

  private readonly _billingRecords = signal<BillingRecordResponse[]>(
    structuredClone(BILLING_RECORDS_MOCK),
  );

  constructor(
    private readonly errorHandler: ErrorHandlerService,
  ) {
    super();
  }

  findAll(
    page: number = 0,
    size: number = 10,
    filters: BillingFilters = {},
  ): Observable<PageResponse<BillingRecordResponse>> {
    const term = (filters.search ?? '').trim().replace('#', '');

    let records = this._billingRecords().filter(record =>
      (!filters.status || record.status === filters.status) &&
      (!filters.patientIds?.length || filters.patientIds.includes(record.patientId)) &&
      // Igual que billing-ms: el texto solo puede ser un número de factura, cita o paciente
      (!term ||
        (/^\d+$/.test(term) &&
          [record.id, record.appointmentId, record.patientId].includes(Number(term)))),
    );

    if (filters.sort) {
      records = this.sortRecords(records, filters.sort);
    }

    return of(this.paginate(records, page, size)).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  summary(): Observable<BillingSummaryResponse> {
    const records = this._billingRecords();

    const totals = (status?: BillingStatus) => {
      const filtered = status
        ? records.filter(record => record.status === status)
        : records;

      return {
        count: filtered.length,
        amount: filtered.reduce((sum, record) => sum + record.amount, 0),
      };
    };

    const now = new Date();

    const paidThisMonthAmount = records
      .filter(record => {
        if (record.status !== 'PAID' || !record.paidAt) {
          return false;
        }

        const paidAt = new Date(record.paidAt);

        return (
          paidAt.getFullYear() === now.getFullYear() &&
          paidAt.getMonth() === now.getMonth()
        );
      })
      .reduce((sum, record) => sum + record.amount, 0);

    const total = totals();
    const pending = totals('PENDING');
    const paid = totals('PAID');
    const cancelled = totals('CANCELLED');

    return of<BillingSummaryResponse>({
      totalCount: total.count,
      totalAmount: total.amount,
      pendingCount: pending.count,
      pendingAmount: pending.amount,
      paidCount: paid.count,
      paidAmount: paid.amount,
      cancelledCount: cancelled.count,
      cancelledAmount: cancelled.amount,
      paidThisMonthAmount,
    }).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  // Formato de Spring: "campo,asc|desc"
  private sortRecords(
    records: BillingRecordResponse[],
    sort: string,
  ): BillingRecordResponse[] {
    const [field, direction] = sort.split(',');
    const factor = direction === 'desc' ? -1 : 1;

    const value = (record: BillingRecordResponse): number =>
      field === 'amount'
        ? record.amount
        : new Date(record.issuedAt).getTime();

    return [...records].sort((a, b) => (value(a) - value(b)) * factor);
  }

  findByPatientId(
    patientId: number,
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<BillingRecordResponse>> {
    const records = this._billingRecords().filter(
      record => record.patientId === patientId,
    );

    return of(this.paginate(records, page, size)).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  create(
    request: CreateBillingRequest,
  ): Observable<BillingRecordResponse> {
    const exists = this._billingRecords().some(
      record => record.appointmentId === request.appointmentId,
    );

    if (exists) {
      return this.handleError(
        new HttpErrorResponse({
          status: 409,
          error: {
            detail: 'Billing record already exists for this appointment.',
          },
        }),
      );
    }

    const now = new Date().toISOString();

    const newRecord: BillingRecordResponse = {
      id: this.getNextId(),
      appointmentId: request.appointmentId,
      patientId: 1,
      amount: request.amount,
      currency: 'PEN',
      status: 'PENDING',
      issuedAt: now,
      paidAt: null,
    };

    this._billingRecords.update(records => [
      ...records,
      newRecord,
    ]);

    return of(newRecord).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  pay(id: number): Observable<BillingRecordResponse> {
    const record = this._billingRecords().find(
      record => record.id === id,
    );

    if (!record) {
      return this.handleError(
        new HttpErrorResponse({
          status: 404,
          error: {
            detail: 'Billing record not found.',
          },
        }),
      );
    }

    if (record.status === 'PAID') {
      return this.handleError(
        new HttpErrorResponse({
          status: 409,
          error: {
            detail: 'Billing record is already paid.',
          },
        }),
      );
    }

    const updatedRecord: BillingRecordResponse = {
      ...record,
      status: 'PAID',
      paidAt: new Date().toISOString(),
    };

    this._billingRecords.update(records =>
      records.map(item =>
        item.id === id ? updatedRecord : item,
      ),
    );

    return of(updatedRecord).pipe(
      delay(this.MOCK_DELAY),
    );
  }

  private paginate(
    records: BillingRecordResponse[],
    page: number,
    size: number,
  ): PageResponse<BillingRecordResponse> {
    const totalElements = records.length;
    const totalPages = Math.ceil(totalElements / size);

    const start = page * size;
    const end = start + size;

    const content = records.slice(start, end);

    return {
      content,
      totalElements,
      totalPages,
      size,
      number: page,
      first: page === 0,
      last: page >= totalPages - 1,
      numberOfElements: content.length,
    };
  }

  private getNextId(): number {
    const records = this._billingRecords();

    return records.length
      ? Math.max(...records.map(record => record.id)) + 1
      : 1;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    this.errorHandler.handle(error);

    return throwError(() => error);
  }
}
