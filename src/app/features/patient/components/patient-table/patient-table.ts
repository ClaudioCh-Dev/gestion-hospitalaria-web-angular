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
  TuiDropdown,
  TuiInput,
  TuiLoader,
  TuiTitle,
} from '@taiga-ui/core';

import {
  TuiAutoColorPipe,
  TuiAvatar,
  TuiComboBox,
  TuiDataListWrapper,
  TuiInitialsPipe,
  TuiItemsWithMore,
  TuiSelect,
  TuiSkeleton,
  TuiStatus,
} from '@taiga-ui/kit';

import {
  TuiTable,
  TuiTableControl,
} from '@taiga-ui/addon-table';

import { PatientDetailComponent } from '../patient-detail/patient-detail';

import {
  PatientDetailResponse,
  PatientResponse,
} from '../../model';

@Component({
  selector: 'app-patient-table',
  imports: [
    FormsModule,

    // Taiga UI
    TuiAutoColorPipe,
    TuiAvatar,
    TuiButton,
    TuiCell,
    TuiCheckbox,
    TuiComboBox,
    TuiDataListWrapper,
    TuiDropdown,
    TuiInitialsPipe,
    TuiInput,
    TuiItemsWithMore,
    TuiLoader,
    TuiSelect,
    TuiStatus,
    TuiTable,
    TuiTableControl,
    TuiTitle,
    // Components
    PatientDetailComponent,
  ],
  templateUrl: './patient-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientTableComponent {

  // ============================
  // Inputs
  // ============================

  readonly patients = input<PatientResponse[]>([]);

  readonly loading = input(false);

  readonly selectedPatient =
    input<PatientDetailResponse | null>(null);

  readonly loadingPatientId =
    input<number | null>(null);

  // ============================
  // Model
  // ============================

  readonly selected = model<PatientResponse[]>([]);

  // ============================
  // Outputs
  // ============================

  readonly edit = output<PatientResponse>();

  readonly more = output<PatientResponse>();

  readonly closeDetail = output<void>();

  // ============================
  // Estado interno
  // ============================

  readonly loadingAction = signal<string | null>(null);

  // ============================
  // Acciones
  // ============================

  protected morePatient(patient: PatientResponse): void {
    this.loadingAction.set('more');

    this.more.emit(patient);
  }

  protected editPatient(patient: PatientResponse): void {
    this.loadingAction.set('edit');

    this.edit.emit(patient);
  }
}