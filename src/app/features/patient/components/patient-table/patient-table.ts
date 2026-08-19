import { ChangeDetectionStrategy, Component, input, model, output, signal } from '@angular/core';
import { PatientDetailComponent } from '../patient-detail/patient-detail';
import { FormsModule } from '@angular/forms';

import {
  TuiButton,
  TuiCell,
  TuiCheckbox,
  TuiDropdown,
  TuiIcon,
  TuiInput,
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

import { PatientResponse } from '../../model/patient.dtos';
import { TuiTable, TuiTableControl, TuiTablePagination } from '@taiga-ui/addon-table';

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
  ],

  templateUrl: './patient-table.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientTableComponent {
  readonly patients = input<PatientResponse[]>([]);

  readonly selected = model<PatientResponse[]>([]);

  readonly edit = output<PatientResponse>();

  readonly more = output<PatientResponse>();

  protected readonly selectedPatient = signal<PatientResponse | null>(null);

  protected morePatient(patient: PatientResponse): void {
    console.log('Paciente seleccionado:', patient);
    this.selectedPatient.set(patient);
  }
}
