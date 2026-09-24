import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { MedicalRecordResponse } from '../interfaces/medical-record-response';
import { MedicalRecordService } from './medical-record.service';

import { MEDICAL_RECORDS_MOCK } from '../mocks/medical-record.mocks';
import { PageResponse } from '@shared/models/page.type';
import { matchesSearch } from '@shared/utils/search';
import { MedicalRecordFilters } from '../interfaces/medical-record-filters';
import { MedicalRecordSummaryResponse } from '../interfaces/medical-record-summary-response';

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
    filters: MedicalRecordFilters = {},
  ): Observable<PageResponse<MedicalRecordResponse>> {

    // Misma semántica que medical-record-listener
    const records = this._medicalRecords().filter(record =>
      (!filters.specialty || record.specialty === filters.specialty) &&
      matchesSearch(
        filters.search,
        record.patientName,
        record.doctorName,
        record.specialty,
        record.reason,
      ),
    );

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

  summary(): Observable<MedicalRecordSummaryResponse> {
    const records = this._medicalRecords();

    return of<MedicalRecordSummaryResponse>({
      totalRecords: records.length,
      uniquePatients: new Set(records.map(record => record.patientId)).size,
      completedRecords: records.filter(record => record.status === 'COMPLETED').length,
      totalAmount: records.reduce((sum, record) => sum + (record.amount ?? 0), 0),
      specialties: [...new Set(records.map(record => record.specialty))].sort(),
    }).pipe(
      delay(this.MOCK_DELAY),
    );
  }
}
