import {
  catchError,
  finalize,
  Observable,
  throwError,
  tap,
} from 'rxjs';

import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../../core/services/alert-notification.service'; 

interface NotificationConfig {
  success?: string;
  loading?: boolean;
}

export function withNotification<T>(
  notificationService: NotificationService,
  config: NotificationConfig = {},
) {
  return (source: Observable<T>): Observable<T> => {

    // =====================================================
    // LOADING
    // =====================================================

    if (config.loading !== false) {
      notificationService.showLoading();
    }

    return source.pipe(

      // ===================================================
      // SUCCESS
      // ===================================================

      tap(() => {

        if (config.success) {
          notificationService.showSuccess(
            config.success,
          );
        }

      }),

      // ===================================================
      // ERROR
      // ===================================================

      catchError(
        (response: HttpErrorResponse) => {

          notificationService.showError(
            response.error,
          );

          return throwError(
            () => response,
          );
        },
      ),

      // ===================================================
      // FINALIZE
      //
      // Se ejecuta tanto en SUCCESS como ERROR
      // ===================================================

      finalize(() => {

        // Si tu NotificationService tiene
        // hideLoading(), úsalo aquí.
        //
        // notificationService.hideLoading();

      }),
    );
  };
}