import { ChangeDetectionStrategy, Component, input, model, output, signal } from '@angular/core';

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

import { TuiTable, TuiTableControl } from '@taiga-ui/addon-table';

import { PatientDetailComponent } from '../patient-detail/patient-detail';

import { PatientDetailResponse, PatientResponse } from '../../interfaces';
import { AvatarDefaultPatientPipe } from '@shared/pipes/avatar-default-patient-pipe';
import { DatePipe, I18nSelectPipe } from '@angular/common';
import { StateMessage } from '@shared/components/state-message/state-message';

@Component({
  selector: 'app-patient-table',
  imports: [
    StateMessage,
    FormsModule,

    // Taiga UI
    TuiAvatar,
    TuiButton,
    TuiCell,
    TuiCheckbox,
    TuiComboBox,
    TuiDataListWrapper,
    TuiDropdown,
    TuiInput,
    TuiItemsWithMore,
    TuiLoader,
    TuiSelect,
    TuiStatus,
    TuiTable,
    TuiTableControl,
    TuiTitle,
    AvatarDefaultPatientPipe,
    I18nSelectPipe,
    DatePipe,  
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

  readonly selectedPatient = input<PatientDetailResponse | null>(null);

  readonly loadingPatientId = input<number | null>(null);


  readonly genderMap = {
  MALE: 'Masculino',
  FEMALE: 'Femenino',
};

  // ============================
  // Model
  // ============================

  readonly selected = model<PatientResponse[]>([]);

  // ============================
  // Outputs
  // ============================

  readonly edit = output<PatientResponse>();

  readonly more = output<PatientResponse>();

  readonly remove = output<PatientResponse>();

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
