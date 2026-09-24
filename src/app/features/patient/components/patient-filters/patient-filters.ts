import { ChangeDetectionStrategy, Component, output } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { TuiButton, TuiInput, TuiTextfield, TuiLabel } from '@taiga-ui/core';

import { TuiChevron, TuiDataListWrapper, TuiSelect } from '@taiga-ui/kit';
import { GENDERS } from '../../constants/patient-options';
import { Gender } from '../../interfaces';

export interface PatientFilters {
  search: string;
  gender: Gender | null;
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

  protected readonly genders = ['Todos', ...GENDERS.map((g) => g.value)] as const;

  protected gender: string | null = this.genders[0];

  readonly filtersChange = output<PatientFilters>();

  readonly create = output<void>();

  protected applyFilters(): void {
    const gender = GENDERS.find((option) => option.value === this.gender)?.id ?? null;

    this.filtersChange.emit({
      search: this.search.trim(),
      gender: gender as Gender | null,
    });
  }
}
