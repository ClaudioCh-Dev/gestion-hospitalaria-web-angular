import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

import {
  TuiAppearance,
  TuiButton,
  TuiIcon,
  TuiTitle,
} from '@taiga-ui/core';

import {
  TuiCardLarge,
  TuiHeader,
} from '@taiga-ui/layout';

@Component({
  selector: 'app-record-card',
  imports: [
    TuiAppearance,
    TuiTitle,
    TuiCardLarge,
    TuiHeader,
    DatePipe
  ],
  templateUrl: './record-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordCard {
  readonly date = input.required<string>();
  readonly title = input.required<string>();
  readonly status = input.required<string>();
  readonly statusClass = input.required<string>();
}