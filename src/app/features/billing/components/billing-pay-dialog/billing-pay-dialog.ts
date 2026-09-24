import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TuiButton, TuiCell, TuiDialogContext, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { injectContext } from '@taiga-ui/polymorpheus';

import { BillingRecordResponse } from '../../interfaces';

export interface BillingPayDialogData {
  record: BillingRecordResponse;
  patientName: string;
}

// Devuelve true solo cuando se confirma el cobro; cerrar o cancelar devuelve false
@Component({
  selector: 'app-billing-pay-dialog',
  imports: [
    CurrencyPipe,
    DatePipe,
    TuiAvatar,
    TuiButton,
    TuiCardLarge,
    TuiCell,
    TuiHeader,
    TuiIcon,
    TuiTitle,
  ],
  templateUrl: './billing-pay-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingPayDialog {
  private readonly context =
    injectContext<TuiDialogContext<boolean, BillingPayDialogData>>();

  protected readonly record = this.context.data.record;

  protected readonly patientName = this.context.data.patientName;

  protected confirm(): void {
    this.context.completeWith(true);
  }

  protected cancel(): void {
    this.context.completeWith(false);
  }
}
