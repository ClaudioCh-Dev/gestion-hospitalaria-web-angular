import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';

import { TuiButton, TuiCell, TuiDialogContext, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { injectContext } from '@taiga-ui/polymorpheus';

import { PatientService } from '@patients/services/patient.service';

import {
  APPOINTMENT_STATUS_APPEARANCES,
  APPOINTMENT_STATUS_LABELS,
} from '../../../appointment/constants/appointment-status';
import { AppointmentService } from '../../../appointment/services/appointment.service';
import { DoctorService } from '../../../doctor/services/doctor.service';
import { BillingRecordResponse, BillingStatus } from '../../interfaces';

@Component({
  selector: 'app-billing-detail-dialog',
  imports: [
    CurrencyPipe,
    DatePipe,
    TuiAvatar,
    TuiBadge,
    TuiButton,
    TuiCardLarge,
    TuiCell,
    TuiHeader,
    TuiTitle,
  ],
  templateUrl: './billing-detail-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingDetailDialog {
  private readonly context =
    injectContext<TuiDialogContext<void, BillingRecordResponse>>();

  private readonly patientService = inject(PatientService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly doctorService = inject(DoctorService);

  protected readonly record = this.context.data;

  protected readonly patientResource = rxResource({
    stream: () => this.patientService.findById(this.record.patientId),
  });

  // Cita facturada y su médico; si algo falla la factura se sigue mostrando
  protected readonly appointmentResource = rxResource({
    stream: () =>
      this.appointmentService.findById(this.record.appointmentId).pipe(
        switchMap((appointment) =>
          this.doctorService.findById(appointment.doctorId).pipe(
            map((doctor) => ({ appointment, doctor })),
            catchError(() => of({ appointment, doctor: null })),
          ),
        ),
      ),
  });

  protected readonly statusLabels: Record<BillingStatus, string> = {
    PENDING: 'Pendiente',
    PAID: 'Pagado',
    CANCELLED: 'Cancelado',
  };

  protected readonly statusAppearances: Record<BillingStatus, string> = {
    PENDING: 'warning',
    PAID: 'positive',
    CANCELLED: 'negative',
  };

  protected readonly statusIcons: Record<BillingStatus, string> = {
    PENDING: '@tui.clock',
    PAID: '@tui.circle-check',
    CANCELLED: '@tui.circle-x',
  };

  protected readonly appointmentStatusLabels = APPOINTMENT_STATUS_LABELS;
  protected readonly appointmentStatusAppearances = APPOINTMENT_STATUS_APPEARANCES;

  protected close(): void {
    this.context.completeWith();
  }
}
