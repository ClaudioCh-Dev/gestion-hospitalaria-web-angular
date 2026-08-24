import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';

import { PatientDetailComponent } from '../patient-detail/patient-detail';

import { FormsModule } from '@angular/forms';

import {
  TuiButton,
  TuiCell,
  TuiCheckbox,
  TuiDropdown,
  TuiIcon,
  TuiInput,
  TuiLoader,
  TuiTitle,
} from '@taiga-ui/core';

import {
  TuiAutoColorPipe,
  TuiAvatar,
  TuiChevron,
  TuiComboBox,
  TuiDataListWrapper,
  TuiInitialsPipe,
  TuiItemsWithMore,
  TuiSelect,
  TuiStatus,
} from '@taiga-ui/kit';

import { PatientDetailResponse, PatientResponse } from '../../model';

import { TuiTable, TuiTableControl, TuiTablePagination } from '@taiga-ui/addon-table';

import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-table',
  imports: [
    FormsModule,
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
    TuiSelect,
    TuiStatus,
    TuiTable,
    TuiTableControl,
    TuiTitle,
    PatientDetailComponent,
    TuiLoader,
  ],
  templateUrl: './patient-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientTableComponent {
  private readonly patientService = inject(PatientService);

  readonly patients = input<PatientResponse[]>([]);

  readonly selected = model<PatientResponse[]>([]);

  readonly edit = output<PatientResponse>();

  readonly more = output<PatientResponse>();

  readonly selectedPatient = input<PatientDetailResponse | null>(null);

  readonly loadingPatientId = input<number | null>(null);

  readonly loadingAction = signal<string | null>(null);

  readonly closeDetail = output<void>();

  protected morePatient(patient: PatientResponse): void {
    this.loadingAction.set('more');
    this.more.emit(patient);
  }

  protected editPatient(patient: PatientResponse): void {
    this.loadingAction.set('edit');
    this.edit.emit(patient);
  }
}
