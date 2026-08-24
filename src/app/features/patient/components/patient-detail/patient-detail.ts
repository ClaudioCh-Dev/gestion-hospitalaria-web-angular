import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { TuiButton, TuiIcon, TuiPopup, TuiTitle, TuiAppearance } from '@taiga-ui/core';
import { TuiAvatar, TuiBadge, TuiDrawer, TuiInitialsPipe, TuiTabs } from '@taiga-ui/kit';

import { PatientDetailResponse } from '../../model';

@Component({
  selector: 'app-patient-detail',

  imports: [
    TuiButton,
    TuiDrawer,
    TuiPopup,
    TuiTabs,
    TuiTitle,
    TuiAvatar,
    TuiInitialsPipe,
    TuiButton,
    TuiIcon,
    TuiPopup,
    TuiAppearance
],

  templateUrl: './patient-detail.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientDetailComponent {

  readonly patient = input<PatientDetailResponse | null>(null);

  readonly close = output<void>();
}