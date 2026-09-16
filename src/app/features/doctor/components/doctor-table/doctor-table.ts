import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
  signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  TuiButton,
  TuiCell,
  TuiCheckbox,
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

import { DoctorResponse } from '../../model/doctor.dtos';

import { DoctorDetailComponent } from '../doctor-detail/doctor-detail';

import { TimeRangePipe } from '@shared/pipes/time-range-pipe';

@Component({
  selector: 'app-doctor-table',
  imports: [
    FormsModule,
    TuiAutoColorPipe,
    TuiAvatar,
    TuiButton,
    TuiCell,
    TuiCheckbox,
    TuiInitialsPipe,
    TuiLoader,
    TuiStatus,
    TuiTable,
    TuiTableControl,
    TuiTitle,
    DoctorDetailComponent,
    TimeRangePipe,
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
}