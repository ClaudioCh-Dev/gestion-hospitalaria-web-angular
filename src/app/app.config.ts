import { provideTaiga } from '@taiga-ui/core';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { TUI_LANGUAGE, TUI_SPANISH_LANGUAGE } from '@taiga-ui/i18n';
import { routes } from './app.routes';
import { signal } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { PatientMockService } from './features/patient/services/patient.service.mock';
import { PatientHttpService } from './features/patient/services/patient.service.http';
import { PatientService } from './features/patient/services/patient.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { DoctorService } from './features/doctor/services/doctor.service';
import { DoctorMockService } from './features/doctor/services/doctor.service.mock';
import { DoctorHttpService } from './features/doctor/services/doctor.service.http';
import { environment } from '../environments/environment';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AppointmentTypeService } from './features/appointment/services/appointment-type.service';
import { AppointmentTypeMockService } from './features/appointment/services/impl/appointment-type-mock.service';
import { AppointmentTypeHttpService } from './features/appointment/services/impl/appointment-type-http.service';
import { BillingRecordService } from './features/billing/services/billing-record.service';
import { BillingRecordMockService } from './features/billing/services/billing-record-mock.service';
import { BillingRecordHttpService } from './features/billing/services/billing-record-http.service';
import { MedicalRecordHttpService } from './features/medical-history/services/medical-record-http.service';
import { MedicalRecordService } from './features/medical-history/services/medical-record.service';
import { MedicalRecordMockService } from './features/medical-history/services/medical-record-mock.service';
import { AppointmentService } from './features/appointment/services/appointment.service';
import { AppointmentMockService } from './features/appointment/services/impl/appointment-mock.service';
import { AppointmentHttpService } from './features/appointment/services/impl/appointment-http.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideTaiga(),

    {
      provide: TUI_LANGUAGE,
      useValue: signal(TUI_SPANISH_LANGUAGE),
    },

    provideHttpClient(
      withInterceptors([authInterceptor,errorInterceptor]),
    ),

    {
      provide: PatientService,
      useClass: environment.useMocks
        ? PatientMockService
        : PatientHttpService,
    },

    {
      provide: DoctorService,
      useClass: environment.useMocks
        ? DoctorMockService
        : DoctorHttpService,
    },

    {
      provide: AppointmentTypeService,
      useClass: environment.useMocks
        ? AppointmentTypeMockService
        : AppointmentTypeHttpService,
    },
    {
      provide: AppointmentService,
      useClass: environment.useMocks
        ? AppointmentMockService
        : AppointmentHttpService,
    },

    {
      provide: BillingRecordService,
      useClass: environment.useMocks
        ? BillingRecordMockService
        : BillingRecordHttpService,
    },

    {
      provide: MedicalRecordService,
      useClass: environment.useMocks
        ? MedicalRecordMockService
        : MedicalRecordHttpService,
    },

    provideRouter(routes, withViewTransitions()),
  ],
};
