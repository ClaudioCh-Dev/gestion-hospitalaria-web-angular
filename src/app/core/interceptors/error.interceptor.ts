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

      // El login muestra su propio mensaje en el formulario
      if (req.url.includes('/auth/login')) {
        return throwError(() => error);
      }

      const problemDetail =
        error.error as ProblemDetailMicroservice;

      notification.httpError(problemDetail);

      return throwError(() => error);
    }),

  );
};