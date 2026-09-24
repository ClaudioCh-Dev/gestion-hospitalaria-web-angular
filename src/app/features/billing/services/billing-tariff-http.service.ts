import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  BillingTariffResponse,
  CreateBillingTariffRequest,
  UpdateBillingTariffRequest,
} from '../interfaces';

import { BillingTariffService } from './billing-tariff.service';
import { environment } from '@environments/environment';

@Injectable()
export class BillingTariffHttpService implements BillingTariffService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.api.baseUrl}/billings/tariffs`;

  findAll(): Observable<BillingTariffResponse[]> {
    return this.http.get<BillingTariffResponse[]>(this.apiUrl);
  }

  findByAppointmentTypeId(
    appointmentTypeId: number,
  ): Observable<BillingTariffResponse> {
    return this.http.get<BillingTariffResponse>(
      `${this.apiUrl}/${appointmentTypeId}`,
    );
  }

  create(
    request: CreateBillingTariffRequest,
  ): Observable<BillingTariffResponse> {
    return this.http.post<BillingTariffResponse>(
      this.apiUrl,
      request,
    );
  }

  update(
    appointmentTypeId: number,
    request: UpdateBillingTariffRequest,
  ): Observable<BillingTariffResponse> {
    return this.http.put<BillingTariffResponse>(
      `${this.apiUrl}/${appointmentTypeId}`,
      request,
    );
  }
}
