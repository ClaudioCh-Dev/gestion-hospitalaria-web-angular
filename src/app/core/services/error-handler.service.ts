import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { NotificationHttpService } from './notification-http.service';

import {
  ProblemDetailMicroservice,
} from '@shared/models/problem.type';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {

  private readonly notification =
    inject(NotificationHttpService);

  handle(error: unknown): void {

    // ==========================================
    // HTTP ERROR
    // ==========================================

    if (error instanceof HttpErrorResponse) {

      const problem =
        this.toProblemDetail(error);

      console.log(
        '🔥 PROBLEM NORMALIZADO:',
        problem,
      );

      this.notification.httpError(problem);

      return;
    }

    // ==========================================
    // ERROR NORMAL
    // ==========================================

    const detail =
      error instanceof Error
        ? error.message
        : 'Ocurrió un error inesperado';

    const problem: ProblemDetailMicroservice = {
      type: 'about:blank',
      title: 'Error',
      status: 500,
      detail,
    };

    this.notification.httpError(problem);
  }

  // ==========================================
  // HTTP ERROR → PROBLEM DETAIL
  // ==========================================

  private toProblemDetail(
    error: HttpErrorResponse,
  ): ProblemDetailMicroservice {

    const body = error.error;

    // ==========================================
    // BACKEND / MOCK DEVUELVE PROBLEM DETAIL
    // ==========================================

    if (
      body &&
      typeof body === 'object'
    ) {

      return {
        type: body.type,
        title:
          body.title ??
          'Error',

        status:
          body.status ??
          error.status,

        detail:
          body.detail ??
          this.getDefaultMessage(
            error.status,
          ),

        instance:
          body.instance,

        code:
          body.code,
      };
    }

    // ==========================================
    // ERROR SIN PROBLEM DETAIL
    // ==========================================

    return {
      type: 'about:blank',
      title: 'Error',
      status: error.status,
      detail:
        this.getDefaultMessage(
          error.status,
        ),
    };
  }

  // ==========================================
  // DEFAULT MESSAGE
  // ==========================================

  private getDefaultMessage(
    status: number,
  ): string {

    switch (status) {

      case 400:
        return 'Solicitud inválida';

      case 401:
        return 'No estás autenticado';

      case 403:
        return 'No tienes permisos para realizar esta acción';

      case 404:
        return 'Recurso no encontrado';

      case 409:
        return 'El recurso ya existe';

      case 500:
        return 'Error interno del servidor';

      default:
        return 'Ocurrió un error inesperado';
    }
  }
}