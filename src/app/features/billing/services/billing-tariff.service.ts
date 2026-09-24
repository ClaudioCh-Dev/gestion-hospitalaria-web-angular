import { Observable } from 'rxjs';

import {
  BillingTariffResponse,
  CreateBillingTariffRequest,
  UpdateBillingTariffRequest,
} from '../interfaces';

export abstract class BillingTariffService {
  abstract findAll(): Observable<BillingTariffResponse[]>;

  abstract findByAppointmentTypeId(
    appointmentTypeId: number,
  ): Observable<BillingTariffResponse>;

  abstract create(
    request: CreateBillingTariffRequest,
  ): Observable<BillingTariffResponse>;

  abstract update(
    appointmentTypeId: number,
    request: UpdateBillingTariffRequest,
  ): Observable<BillingTariffResponse>;
}
