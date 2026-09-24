import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { TuiButton, TuiDialogContext, TuiIcon } from '@taiga-ui/core';
import { TuiBadge, TuiStatus } from '@taiga-ui/kit';
import { injectContext } from '@taiga-ui/polymorpheus';

import { PatientService } from '@patients/services/patient.service';

import { BillingRecordResponse, BillingStatus } from '../../interfaces';

@Component({
  selector: 'app-billing-detail-dialog',
  imports: [DatePipe, DecimalPipe, TuiBadge, TuiButton, TuiIcon, TuiStatus],
  templateUrl: './billing-detail-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingDetailDialog {
  private readonly context =
    injectContext<TuiDialogContext<void, BillingRecordResponse>>();

  private readonly patientService = inject(PatientService);

  protected readonly record = this.context.data;

  protected readonly patientResource = rxResource({
    stream: () => this.patientService.findById(this.record.patientId),
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

  protected close(): void {
    this.context.completeWith();
  }
}
