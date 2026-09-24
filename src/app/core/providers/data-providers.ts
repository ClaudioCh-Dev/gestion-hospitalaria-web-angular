import { Provider } from '@angular/core';

import { AppointmentTypeService } from '../../features/appointment/services/appointment-type.service';
import { AppointmentService } from '../../features/appointment/services/appointment.service';
import { AppointmentHttpService } from '../../features/appointment/services/impl/appointment-http.service';
import { AppointmentTypeHttpService } from '../../features/appointment/services/impl/appointment-type-http.service';
import { BillingRecordHttpService } from '../../features/billing/services/billing-record-http.service';
import { BillingRecordService } from '../../features/billing/services/billing-record.service';
import { BillingTariffHttpService } from '../../features/billing/services/billing-tariff-http.service';
import { BillingTariffService } from '../../features/billing/services/billing-tariff.service';
import { DoctorService } from '../../features/doctor/services/doctor.service';
import { DoctorHttpService } from '../../features/doctor/services/doctor.service.http';
import { MedicalRecordHttpService } from '../../features/medical-history/services/medical-record-http.service';
import { MedicalRecordService } from '../../features/medical-history/services/medical-record.service';
import { PatientService } from '../../features/patient/services/patient.service';
import { PatientHttpService } from '../../features/patient/services/patient.service.http';
import { UserService } from '../../features/user/services/user.service';
import { UserHttpService } from '../../features/user/services/user.service.http';

/**
 * Implementaciones de los servicios de datos contra el backend real.
 *
 * La configuración "mock" (angular.json → fileReplacements) sustituye este archivo por
 * data-providers.mock.ts; así los mocks y sus datos no entran en el bundle de producción.
 * Si se añade un servicio aquí, añadirlo también en el .mock.ts.
 */
export const DATA_PROVIDERS: Provider[] = [
  { provide: PatientService, useClass: PatientHttpService },
  { provide: DoctorService, useClass: DoctorHttpService },
  { provide: AppointmentService, useClass: AppointmentHttpService },
  { provide: AppointmentTypeService, useClass: AppointmentTypeHttpService },
  { provide: BillingRecordService, useClass: BillingRecordHttpService },
  { provide: BillingTariffService, useClass: BillingTariffHttpService },
  { provide: MedicalRecordService, useClass: MedicalRecordHttpService },
  { provide: UserService, useClass: UserHttpService },
];
