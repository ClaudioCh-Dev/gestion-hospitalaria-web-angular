import { ChangeDetectionStrategy, Component, TemplateRef, inject, input, model, output, signal, viewChild } from '@angular/core';
import { HasPermission } from '@shared/directives/has-permission.directive';

import { FormsModule } from '@angular/forms';

import {
  TuiButton,
  TuiCell,
  TuiCheckbox,
  TuiDialogService,
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
import { MobileDetail, MobileDetailField } from '@shared/components/mobile-detail/mobile-detail';
import { TuiAppBar, TuiFloatingContainer } from '@taiga-ui/layout';

@Component({
  selector: 'app-patient-table',
  imports: [HasPermission, 
    MobileDetail,
    TuiAppBar,
    TuiFloatingContainer,
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

  private readonly dialogs = inject(TuiDialogService);

  private readonly mobileDetailTemplate = viewChild.required<TemplateRef<unknown>>('mobileDetail');

  // ============================
  // Detalle móvil
  // ============================

  protected openMobileDetail(patient: PatientResponse): void {
    this.dialogs
      .open(this.mobileDetailTemplate(), { appearance: 'fullscreen', data: patient })
      .subscribe();
  }

  protected patientFields(patient: PatientResponse): MobileDetailField[] {
    const gender = patient.gender
      ? (this.genderMap as Record<string, string>)[patient.gender] ?? patient.gender
      : 'Sin registrar';

    return [
      { icon: '@tui.id-card', label: 'DNI', value: patient.documentNumber },
      { icon: '@tui.user', label: 'Género', value: gender },
      {
        icon: '@tui.cake',
        label: 'Fecha de nacimiento',
        value: patient.birthDate ? patient.birthDate.split('-').reverse().join('/') : 'Sin registrar',
      },
      { icon: '@tui.phone', label: 'Teléfono', value: patient.phone || 'Sin teléfono' },
      { icon: '@tui.mail', label: 'Correo', value: patient.email || 'Sin correo', wide: true },
    ];
  }

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
