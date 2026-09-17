import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { MedicalRecordResponse } from '../interfaces/medical-record-response';
import { MedicalRecordService } from './medical-record.service';

import { MEDICAL_RECORDS_MOCK } from '../mocks/medical-record.mocks';
import { PageResponse } from '@shared/models/page.type';

@Injectable()
export class MedicalRecordMockService
  extends MedicalRecordService {

  private readonly MOCK_DELAY = 1500;

  private readonly _medicalRecords =
    signal<MedicalRecordResponse[]>(
      structuredClone(MEDICAL_RECORDS_MOCK),
    );

  // =====================================================
  // FIND ALL
  // =====================================================

  findAll(
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<MedicalRecordResponse>> {

    const records = this._medicalRecords();

    const totalElements = records.length;
    const totalPages = Math.ceil(totalElements / size);

    const start = page * size;
    const end = start + size;

    const content = records.slice(start, end);

    const response: PageResponse<MedicalRecordResponse> = {
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
  // FIND BY PATIENT
  // =====================================================

  findByPatientId(
    patientId: number,
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<MedicalRecordResponse>> {

    const records = this._medicalRecords()
      .filter(record => record.patientId === patientId);

    const totalElements = records.length;
    const totalPages = Math.ceil(totalElements / size);

    const start = page * size;
    const end = start + size;

    const content = records.slice(start, end);

    const response: PageResponse<MedicalRecordResponse> = {
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
}