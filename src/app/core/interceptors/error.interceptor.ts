import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';

import { inject } from '@angular/core';
import { ProblemDetailMicroservice } from '@shared/models/problem.type';

import {
  catchError,
  throwError,
} from 'rxjs';

import { NotificationHttpService } from '@core/services/notification-http.service';


export const errorInterceptor: HttpInterceptorFn = (
  req,
  next,
) => {

  const notification = inject(
    NotificationHttpService,
  );

  return next(req).pipe(

    catchError((error: HttpErrorResponse) => {

      // El login y la activación de cuenta muestran su propio mensaje en la página; el refresh
      // fallido (p. ej. al arrancar sin sesión) no es un error que deba ver el usuario
      if (
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/refresh-token') ||
        req.url.includes('/users/activate')
      ) {
        return throwError(() => error);
      }

      const problemDetail =
        error.error as ProblemDetailMicroservice;

      notification.httpError(problemDetail);

      return throwError(() => error);
    }),

  );
};