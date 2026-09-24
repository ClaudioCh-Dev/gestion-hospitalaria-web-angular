import { CurrencyPipe } from '@angular/common';
import { HasPermission } from '@shared/directives/has-permission.directive';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, filter, forkJoin, of, switchMap } from 'rxjs';

import { TuiTable } from '@taiga-ui/addon-table';
import {
  TuiButton,
  TuiCell,
  TuiDialogService,
  TuiTitle,
} from '@taiga-ui/core';
import {
  TUI_CONFIRM,
  TuiBadge,
  TuiButtonLoading,
  TuiStatus,
  type TuiConfirmData,
} from '@taiga-ui/kit';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';

import { NotificationService } from '@core/services/alert-notification.service';
import { withNotification } from '@shared/operators/with-notification';

import { BillingTariffResponse } from '../../../billing/interfaces';
import { BillingTariffService } from '../../../billing/services/billing-tariff.service';
import { getAppointmentTypeColor } from '../../constants/appointment-type-colors';
import { AppointmentTypeResponse } from '../../interfaces';
import { AppointmentTypeService } from '../../services/appointment-type.service';
import {
  AppointmentTypeModal,
  AppointmentTypeModalData,
} from '../../components/appointment-type-modal/appointment-type-modal';
import { StateMessage } from '@shared/components/state-message/state-message';
import { MobileDetail, MobileDetailField } from '@shared/components/mobile-detail/mobile-detail';
import { TuiAppBar, TuiFloatingContainer } from '@taiga-ui/layout';

interface AppointmentTypeRow {
  appointmentType: AppointmentTypeResponse;
  tariff: BillingTariffResponse | null;
}

@Component({
  selector: 'app-appointment-types-page',
  imports: [HasPermission, 
    MobileDetail,
    TuiAppBar,
    TuiFloatingContainer,
    StateMessage,
    CurrencyPipe,
    TuiBadge,
    TuiButton,
    TuiButtonLoading,
    TuiCell,
    TuiStatus,
    TuiTable,
    TuiTitle,
  ],
  templateUrl: './appointment-types-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentTypesPage {
  private readonly appointmentTypeService = inject(AppointmentTypeService);
  private readonly tariffService = inject(BillingTariffService);
  private readonly dialogs = inject(TuiDialogService);
  private readonly notificationService = inject(NotificationService);

  protected readonly getColor = getAppointmentTypeColor;

  protected readonly showInactive = signal(true);

  protected readonly deactivatingId = signal<number | null>(null);

  // Si billing-ms no responde, la página sigue funcionando sin precios
  protected readonly resource = rxResource({
    stream: () =>
      forkJoin({
        types: this.appointmentTypeService.findAll(),
        tariffs: this.tariffService
          .findAll()
          .pipe(catchError(() => of<BillingTariffResponse[] | null>(null))),
      }),
  });

  protected readonly tariffsUnavailable = computed(
    () => this.resource.hasValue() && this.resource.value().tariffs === null,
  );

  protected readonly rows = computed<AppointmentTypeRow[]>(() => {
    const value = this.resource.value();

    if (!value) {
      return [];
    }

    const tariffs = new Map(
      (value.tariffs ?? []).map((tariff) => [tariff.appointmentTypeId, tariff]),
    );

    return value.types
      .filter((type) => this.showInactive() || type.active)
      .map((appointmentType) => ({
        appointmentType,
        tariff: tariffs.get(appointmentType.id) ?? null,
      }));
  });

  protected readonly activeCount = computed(
    () => this.resource.value()?.types.filter((type) => type.active).length ?? 0,
  );

  protected create(): void {
    this.openModal('Nuevo tipo de cita', null);
  }

  private readonly mobileDetailTemplate = viewChild.required<TemplateRef<unknown>>('mobileDetail');

  protected openMobileDetail(row: AppointmentTypeRow): void {
    this.dialogs
      .open(this.mobileDetailTemplate(), { appearance: 'fullscreen', data: row })
      .subscribe();
  }

  protected typeFields(row: AppointmentTypeRow): MobileDetailField[] {
    const price = row.tariff
      ? new Intl.NumberFormat('es-PE', { style: 'currency', currency: row.tariff.currency }).format(row.tariff.price)
      : 'Sin tarifa';

    return [
      { icon: '@tui.file-text', label: 'Descripción', value: row.appointmentType.description || 'Sin descripción' },
      { icon: '@tui.banknote', label: 'Precio', value: price },
      { icon: '@tui.palette', label: 'Color en la agenda', value: this.getColor(row.appointmentType.color).label },
    ];
  }

  protected edit(row: AppointmentTypeRow): void {
    this.openModal('Editar tipo de cita', row);
  }

  protected deactivate(row: AppointmentTypeRow): void {
    const data: TuiConfirmData = {
      content: `El tipo de cita <strong>${row.appointmentType.title}</strong> dejará de estar disponible para nuevas citas.`,
      yes: 'Desactivar',
      no: 'Cancelar',
      appearance: 'primary-destructive',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: '¿Desactivar tipo de cita?',
        size: 's',
        data,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.deactivatingId.set(row.appointmentType.id);

          return this.appointmentTypeService.deactivate(row.appointmentType.id).pipe(
            withNotification(this.notificationService, {
              success: 'Tipo de cita desactivado correctamente',
            }),
          );
        }),
      )
      .subscribe({
        next: () => {
          this.deactivatingId.set(null);
          this.resource.reload();
        },
        error: () => this.deactivatingId.set(null),
      });
  }

  protected toggleInactive(): void {
    this.showInactive.update((value) => !value);
  }

  private openModal(label: string, data: AppointmentTypeModalData | null): void {
    this.dialogs
      .open<boolean>(new PolymorpheusComponent(AppointmentTypeModal), {
        label,
        size: 'm',
        data,
      })
      .pipe(filter(Boolean))
      .subscribe(() => this.resource.reload());
  }
}
