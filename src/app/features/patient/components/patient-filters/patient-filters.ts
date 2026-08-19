import { ChangeDetectionStrategy, Component, output } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { TuiButton, TuiInput, TuiTextfield, TuiLabel } from '@taiga-ui/core';

import { TuiChevron, TuiDataListWrapper, TuiSelect } from '@taiga-ui/kit';
import { GENDERS } from '../../constans/patient-options';

export interface PatientFilters {
  search: string;
  gender: string | null;
}

@Component({
  selector: 'app-patient-filters',

  imports: [
    FormsModule,
    TuiChevron,
    TuiDataListWrapper,
    TuiInput,
    TuiSelect,
    TuiTextfield,
    TuiLabel,
  ],

  templateUrl: './patient-filters.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientFiltersComponent {
  protected search = '';

  protected readonly genders = ['Todos', ...GENDERS] as const;

  protected gender: string | null = this.genders[0];

  readonly filtersChange = output<PatientFilters>();

  readonly create = output<void>();

  protected applyFilters(): void {
    this.filtersChange.emit({
      search: this.search,
      gender: this.gender,
    });
  }
}
