import { DatePipe, LowerCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { map, Observable } from 'rxjs';

import { TuiButton, TuiDialogContext, TuiIcon } from '@taiga-ui/core';
import { TuiBadge, TuiButtonLoading, TuiStatus } from '@taiga-ui/kit';
import { injectContext } from '@taiga-ui/polymorpheus';

import { NotificationService } from '@core/services/alert-notification.service';
import { withNotification } from '@shared/operators/with-notification';
import { PatientService } from '@patients/services/patient.service';

import { DoctorResponse } from '../../../doctor/intefaces';
import { AppointmentResponse, AppointmentStatus } from '../../interfaces';
import { AppointmentService } from '../../services/appointment.service';

export interface AppointmentDetailData {
  appointment: AppointmentResponse;
  doctor?: DoctorResponse;
}

type AppointmentAction = 'CONFIRM' | 'COMPLETE' | 'CANCEL';

interface ActionConfig {
  label: string;
  confirmLabel: string;
  icon: string;
  appearance: string;
  confirmAppearance: string;
  success: string;
}

@Component({
  selector: 'app-appointment-detail-dialog',
  imports: [DatePipe, LowerCasePipe, TuiBadge, TuiButton, TuiButtonLoading, TuiIcon, TuiStatus],
  templateUrl: './appointment-detail-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentDetailDialog {
  private readonly context =
    injectContext<TuiDialogContext<AppointmentResponse | null, AppointmentDetailData>>();

  private readonly appointmentService = inject(AppointmentService);
  private readonly patientService = inject(PatientService);
  private readonly notificationService = inject(NotificationService);

  protected readonly doctor = this.context.data.doctor ?? null;

  protected readonly appointment = signal(this.context.data.appointment);

  protected readonly pendingAction = signal<AppointmentAction | null>(null);

  protected readonly saving = signal(false);

  protected readonly patientResource = rxResource({
    params: () => ({ id: this.appointment().patientId }),
    stream: ({ params }) => this.patientService.findById(params.id),
  });

  protected readonly statusLabels: Record<AppointmentStatus, string> = {
    [AppointmentStatus.SCHEDULED]: 'Programada',
    [AppointmentStatus.CONFIRMED]: 'Confirmada',
    [AppointmentStatus.COMPLETED]: 'Completada',
    [AppointmentStatus.CANCELLED]: 'Cancelada',
  };

  protected readonly statusAppearances: Record<AppointmentStatus, string> = {
    [AppointmentStatus.SCHEDULED]: 'info',
    [AppointmentStatus.CONFIRMED]: 'positive',
    [AppointmentStatus.COMPLETED]: 'neutral',
    [AppointmentStatus.CANCELLED]: 'negative',
  };

  protected readonly actionConfig: Record<AppointmentAction, ActionConfig> = {
    CONFIRM: {
      label: 'Confirmar',
      confirmLabel: '¿Confirmar esta cita?',
      icon: '@tui.check',
      appearance: 'primary',
      confirmAppearance: 'primary',
      success: 'Cita confirmada correctamente',
    },
    COMPLETE: {
      label: 'Completar',
      confirmLabel: '¿Marcar la cita como completada?',
      icon: '@tui.circle-check',
      appearance: 'secondary',
      confirmAppearance: 'primary',
      success: 'Cita completada correctamente',
    },
    CANCEL: {
      label: 'Cancelar cita',
      confirmLabel: '¿Cancelar esta cita? Esta acción no se puede deshacer.',
      icon: '@tui.x',
      appearance: 'secondary-destructive',
      confirmAppearance: 'primary-destructive',
      success: 'Cita cancelada correctamente',
    },
  };

  // Las citas completadas o canceladas son estados finales en el backend
  protected readonly availableActions = computed<AppointmentAction[]>(() => {
    switch (this.appointment().status) {
      case AppointmentStatus.SCHEDULED:
        return ['CONFIRM', 'COMPLETE', 'CANCEL'];
      case AppointmentStatus.CONFIRMED:
        return ['COMPLETE', 'CANCEL'];
      default:
        return [];
    }
  });

  protected readonly endTime = computed(() => {
    const { scheduledAt, durationMinutes } = this.appointment();
    const end = new Date(scheduledAt);

    end.setMinutes(end.getMinutes() + durationMinutes);

    return end;
  });

  protected requestAction(action: AppointmentAction): void {
    this.pendingAction.set(action);
  }

  protected dismissAction(): void {
    this.pendingAction.set(null);
  }

  protected executeAction(): void {
    const action = this.pendingAction();

    if (!action) {
      return;
    }

    this.saving.set(true);

    this.runAction(action)
      .pipe(
        withNotification(this.notificationService, {
          success: this.actionConfig[action].success,
        }),
      )
      .subscribe({
        next: (updated) => {
          this.saving.set(false);
          this.context.completeWith(updated);
        },
        error: () => {
          this.saving.set(false);
          this.pendingAction.set(null);
        },
      });
  }

  protected close(): void {
    this.context.completeWith(null);
  }

  private runAction(action: AppointmentAction): Observable<AppointmentResponse> {
    const id = this.appointment().id;

    if (action === 'CANCEL') {
      return this.appointmentService
        .cancel(id)
        .pipe(map(() => ({ ...this.appointment(), status: AppointmentStatus.CANCELLED })));
    }

    const status =
      action === 'CONFIRM' ? AppointmentStatus.CONFIRMED : AppointmentStatus.COMPLETED;

    return this.appointmentService.updateStatus(id, { status });
  }
}
