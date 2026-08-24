import { provideTaiga } from '@taiga-ui/core';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
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
  ],
};
