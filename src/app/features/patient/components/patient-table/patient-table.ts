import {ChangeDetectionStrategy, Component, inject, input, model, output, signal} from '@angular/core';

import {PatientDetailComponent} from '../patient-detail/patient-detail';

import {FormsModule} from '@angular/forms';

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

import {
  PatientDetailResponse,
  PatientResponse,
} from '../../model/patient.dtos';

import {TuiTable, TuiTableControl, TuiTablePagination} from '@taiga-ui/addon-table';

import {PatientService} from '../../services/patient.service';

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

  private readonly patientService = inject(PatientService);

  readonly patients = input<PatientResponse[]>([]);

  readonly selected = model<PatientResponse[]>([]);

  readonly edit = output<PatientResponse>();

  readonly more = output<PatientResponse>();

  protected readonly selectedPatient =
    signal<PatientDetailResponse | null>(null);

  protected morePatient(patient: PatientResponse): void {

    console.log('Buscando detalle del paciente:', patient.id);

    this.patientService
      .findById(patient.id)
      .subscribe({
        next: detail => {
          console.log('Detalle recibido:', detail);

          this.selectedPatient.set(detail);
        },
        error: error => {
          console.error('Error obteniendo paciente:', error);
        },
      });
  }
}