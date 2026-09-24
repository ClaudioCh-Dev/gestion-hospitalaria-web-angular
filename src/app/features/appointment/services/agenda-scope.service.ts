import { Injectable, computed, inject } from '@angular/core';
import { Observable, forkJoin, map, shareReplay, switchMap } from 'rxjs';

import { AuthService } from '@core/services/auth.service';

import { DoctorResponse } from '../../doctor/interfaces';
import { DoctorService } from '../../doctor/services/doctor.service';
import { AppointmentResponse } from '../interfaces';
import { AppointmentService } from './appointment.service';

/**
 * Alcance de la agenda según permisos:
 * - APPOINTMENT_READ (administración): todos los médicos y todas las citas.
 * - Sin él (rol DOCTOR, solo APPOINTMENT_READ_BY_DOCTOR): únicamente el médico del
 *   usuario (GET /doctors/crud/me) y sus citas (GET /appointments/crud/doctor/{id}).
 *   appointment-ms rechaza con 403 cualquier otra agenda.
 */
@Injectable({ providedIn: 'root' })
export class AgendaScope {
  private readonly authService = inject(AuthService);
  private readonly doctorService = inject(DoctorService);
  private readonly appointmentService = inject(AppointmentService);

  readonly fullAgenda = computed(() => this.authService.hasPermission('APPOINTMENT_READ'));

  private myDoctor$: Observable<DoctorResponse> | null = null;
  private myDoctorUserId: number | null = null;

  // Médico del usuario, cacheado por usuario (otro login vuelve a pedirlo)
  myDoctor(): Observable<DoctorResponse> {
    const userId = this.authService.currentUser()?.userId ?? null;

    if (!this.myDoctor$ || this.myDoctorUserId !== userId) {
      this.myDoctorUserId = userId;
      this.myDoctor$ = this.doctorService.findMe().pipe(shareReplay(1));
    }

    return this.myDoctor$;
  }

  // Filas de la agenda: todos los médicos o solo el propio
  doctors(): Observable<DoctorResponse[]> {
    return this.fullAgenda()
      ? this.doctorService.findAll(0, 100).pipe(map((page) => page.content))
      : this.myDoctor().pipe(map((doctor) => [doctor]));
  }

  // Citas de una fecha (YYYY-MM-DD)
  findByDate(date: string): Observable<AppointmentResponse[]> {
    return this.findByDates([date]).pipe(map(([appointments]) => appointments));
  }

  // Citas de varias fechas, en el mismo orden. Para el médico es una sola petición.
  findByDates(dates: string[]): Observable<AppointmentResponse[][]> {
    if (this.fullAgenda()) {
      return forkJoin(dates.map((date) => this.appointmentService.findByDate(date)));
    }

    return this.myDoctor().pipe(
      switchMap((doctor) => this.appointmentService.findByDoctor(doctor.id)),
      map((appointments) =>
        dates.map((date) => appointments.filter((appointment) => appointment.scheduledAt.startsWith(date))),
      ),
    );
  }
}
