import { ChangeDetectionStrategy, Component, input, model, output, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { TuiButton, TuiCell, TuiCheckbox, TuiTitle } from '@taiga-ui/core';

import { TuiAutoColorPipe, TuiAvatar, TuiInitialsPipe, TuiStatus } from '@taiga-ui/kit';

import { TuiTable, TuiTableControl } from '@taiga-ui/addon-table';

import { DoctorResponse } from '../../model/doctor.dtos';
import { DoctorDetailComponent } from '../doctor-detail/doctor-detail';

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
    TuiStatus,

    TuiTable,
    TuiTableControl,
    TuiTitle,

    DoctorDetailComponent
  ],

  templateUrl: './doctor-table.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoctorTableComponent {
  readonly doctors = input<DoctorResponse[]>([]);

  readonly selected = model<DoctorResponse[]>([]);

  readonly edit = output<DoctorResponse>();

  readonly more = output<DoctorResponse>();

  protected readonly selectedDoctor = signal<DoctorResponse | null>(null);

  protected moreDoctor(doctor: DoctorResponse): void {
    console.log('Doctor seleccionado:', doctor);

    this.selectedDoctor.set(doctor);

    this.more.emit(doctor);
  }
}
