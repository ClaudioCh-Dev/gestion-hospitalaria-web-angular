import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';

import { TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';

import { NotificationService } from '@core/services/alert-notification.service';
import { FormField, ModalForm } from '@shared/components/modal-form/modal-form';
import { withNotification } from '@shared/operators/with-notification';

import { BillingTariffResponse } from '../../../billing/interfaces';
import { BillingTariffService } from '../../../billing/services/billing-tariff.service';
import { AppointmentTypeResponse } from '../../interfaces';
import { AppointmentTypeService } from '../../services/appointment-type.service';

export interface AppointmentTypeModalData {
  appointmentType: AppointmentTypeResponse;
  tariff: BillingTariffResponse | null;
}

const DEFAULT_CURRENCY = 'PEN';

@Component({
  selector: 'app-appointment-type-modal',
  imports: [ModalForm],
  templateUrl: './appointment-type-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentTypeModal {
  private readonly context =
    injectContext<TuiDialogContext<boolean, AppointmentTypeModalData | null>>();

  private readonly appointmentTypeService = inject(AppointmentTypeService);
  private readonly tariffService = inject(BillingTariffService);
  private readonly notificationService = inject(NotificationService);

  protected readonly isEdit = !!this.context.data;

  protected readonly submitted = signal(false);

  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),

    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    price: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)],
    }),

    active: new FormControl(true, { nonNullable: true }),
  });

  protected readonly fields: FormField[] = [
    {
      name: 'title',
      label: 'Nombre',
      placeholder: 'Ej. Consulta general',
      type: 'text',
      errorMessages: { required: 'El nombre es requerido' },
    },
    {
      name: 'price',
      label: 'Precio (S/)',
      placeholder: 'Ej. 80.00',
      type: 'text',
      errorMessages: {
        required: 'El precio es requerido',
        pattern: 'Ingrese un monto válido (máx. 2 decimales)',
      },
    },
    {
      name: 'description',
      label: 'Descripción',
      placeholder: 'Ingrese una descripción',
      type: 'text',
      errorMessages: { required: 'La descripción es requerida' },
    },
    ...(this.isEdit
      ? [
          {
            name: 'active',
            label: 'Activo',
            placeholder: '',
            type: 'checkbox' as const,
          },
        ]
      : []),
  ];

  constructor() {
    const data = this.context.data;

    if (data) {
      this.form.patchValue({
        title: data.appointmentType.title,
        description: data.appointmentType.description,
        active: data.appointmentType.active,
        price: data.tariff ? String(data.tariff.price) : '',
      });
    }
  }

  protected save(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, description, price, active } = this.form.getRawValue();

    const request$ = this.context.data
      ? this.update(this.context.data, { title, description, active }, Number(price))
      : this.appointmentTypeService.create({ title, description, price: Number(price) });

    request$
      .pipe(
        withNotification(this.notificationService, {
          success: this.isEdit
            ? 'Tipo de cita actualizado correctamente'
            : 'Tipo de cita creado correctamente',
        }),
      )
      .subscribe({
        next: () => this.context.completeWith(true),
      });
  }

  protected cancel(): void {
    this.context.completeWith(false);
  }

  // Al crear, billing-ms genera la tarifa a partir del evento appointment-created-type.
  // Al editar, la tarifa se actualiza aparte (o se crea si aún no existe).
  private update(
    data: AppointmentTypeModalData,
    request: { title: string; description: string; active: boolean },
    price: number,
  ): Observable<unknown> {
    const id = data.appointmentType.id;
    const currency = data.tariff?.currency ?? DEFAULT_CURRENCY;

    let tariff$: Observable<unknown> = of(null);

    if (!data.tariff) {
      tariff$ = this.tariffService.create({ appointmentTypeId: id, price, currency });
    } else if (data.tariff.price !== price) {
      tariff$ = this.tariffService.update(id, { price, currency });
    }

    return forkJoin([this.appointmentTypeService.update(id, request), tariff$]);
  }
}
