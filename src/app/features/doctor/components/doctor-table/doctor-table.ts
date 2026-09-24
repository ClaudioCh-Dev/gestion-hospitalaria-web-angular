import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  TuiButton,
  TuiCell,
  TuiCheckbox,
  TuiDialogService,
  TuiLoader,
  TuiTitle,
} from '@taiga-ui/core';

import {
  TuiAutoColorPipe,
  TuiAvatar,
  TuiInitialsPipe,
  TuiStatus,
} from '@taiga-ui/kit';

import {
  TuiTable,
  TuiTableControl,
} from '@taiga-ui/addon-table';

import { DoctorResponse } from '../../interfaces';

import { DoctorDetailComponent } from '../doctor-detail/doctor-detail';

import { TimeRangePipe } from '@shared/pipes/time-range-pipe';
import { AvatarDefaultDoctorPipe } from '@shared/pipes/avatar-default-doctor-pipe';
import { StateMessage } from '@shared/components/state-message/state-message';
import { MobileDetail, MobileDetailField } from '@shared/components/mobile-detail/mobile-detail';
import { TuiAppBar, TuiFloatingContainer } from '@taiga-ui/layout';

@Component({
  selector: 'app-doctor-table',
  imports: [
    StateMessage,
    FormsModule,
    MobileDetail,
    TuiAppBar,
    TuiFloatingContainer,
    TuiAvatar,
    TuiButton,
    TuiCell,
    TuiCheckbox,
    TuiLoader,
    TuiStatus,
    TuiTable,
    TuiTableControl,
    TuiTitle,
    DoctorDetailComponent,
    TimeRangePipe,
    AvatarDefaultDoctorPipe,
  ],
  templateUrl: './doctor-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorTableComponent {

  // =====================================================
  // INPUTS
  // =====================================================

  readonly doctors =
    input<DoctorResponse[]>([]);

  readonly loading =
    input(false);

  readonly loadingDoctorId =
    input<number | null>(null);

  readonly loadingAction =
    input<'edit' | 'more' | null>(null);

  // =====================================================
  // SELECTION
  // =====================================================

  readonly selected =
    model<DoctorResponse[]>([]);

  // =====================================================
  // OUTPUTS
  // =====================================================

  readonly edit =
    output<DoctorResponse>();

  readonly more =
    output<DoctorResponse>();

  // =====================================================
  // DETAIL
  // =====================================================

  readonly selectedDoctor =
  input<DoctorResponse | null>(null);

  readonly closeDetail = output<void>();

  // =====================================================
  // EDIT
  // =====================================================

  protected editDoctor(
    doctor: DoctorResponse,
  ): void {

    this.edit.emit(doctor);
  }

  // =====================================================
  // MORE
  // =====================================================

  protected moreDoctor(
    doctor: DoctorResponse,
  ): void {

    this.more.emit(doctor);
  }

  // =====================================================
  // DETALLE MÓVIL
  // =====================================================

  private readonly dialogs = inject(TuiDialogService);

  private readonly mobileDetailTemplate = viewChild.required<TemplateRef<unknown>>('mobileDetail');

  protected openMobileDetail(doctor: DoctorResponse): void {
    this.dialogs
      .open(this.mobileDetailTemplate(), { appearance: 'fullscreen', data: doctor })
      .subscribe();
  }

  protected doctorFields(doctor: DoctorResponse): MobileDetailField[] {
    const schedule = doctor.scheduleStart && doctor.scheduleEnd
      ? `${doctor.scheduleStart.slice(0, 5)} - ${doctor.scheduleEnd.slice(0, 5)}`
      : 'Sin horario';

    return [
      { icon: '@tui.id-card', label: 'Colegiatura', value: doctor.licenseNumber },
      { icon: '@tui.stethoscope', label: 'Especialidad', value: doctor.specialtyName },
      { icon: '@tui.clock', label: 'Horario de atención', value: schedule },
      { icon: '@tui.phone', label: 'Teléfono', value: doctor.phone || 'Sin teléfono' },
      { icon: '@tui.mail', label: 'Correo', value: doctor.email || 'Sin correo', wide: true },
    ];
  }
}