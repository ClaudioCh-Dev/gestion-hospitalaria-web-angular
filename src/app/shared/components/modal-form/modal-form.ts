import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TuiDay } from '@taiga-ui/cdk';

import {
  TuiButton,
  TuiCalendar,
  TuiCheckbox,
  TuiDataList,
  TuiScrollRef,
  TuiTextfield,
} from '@taiga-ui/core';

import { TuiBadge, TuiChevron, TuiDataListWrapper, TuiInputDate, TuiSelect } from '@taiga-ui/kit';

export type FormFieldType = 'text' | 'email' | 'date' | 'select' | 'checkbox';


export interface FormOption {
  key: string;
  value: string | number;
}

export interface FormField {
  name: string;
  label: string;
  placeholder: string;
  type: FormFieldType;

  options?: readonly FormOption[];

  valueField?: string;

  errorMessages?: {
    required?: string;
    pattern?: string;
    email?: string;
  };
}

@Component({
  selector: 'app-modal-form',

  imports: [
    ReactiveFormsModule,

    TuiBadge,
    TuiButton,
    TuiCheckbox,
    TuiDataListWrapper,
    TuiSelect,
    TuiTextfield,
    TuiCalendar,
    TuiInputDate,

    FormsModule,
    ScrollingModule,
    TuiChevron,
    TuiDataList,
    TuiScrollRef,
    TuiSelect,
  ],

  templateUrl: './modal-form.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalForm {

  protected readonly Math = Math;

  readonly form = input.required<FormGroup>();

  readonly fields = input.required<readonly FormField[]>();

  readonly submitted = input(false);

  readonly submit = output<void>();

  readonly cancel = output<void>();

  constructor() {
    effect(() => {
      const form = this.form();

      console.log('📋 FORM RECIBIDO:', form);
      console.log('📦 VALORES DEL FORM:', form.value);
      console.log('🎯 CONTROLES:', form.controls);
    });
  }

  protected getControl(name: string): FormControl {
    return this.form().get(name) as FormControl;
  }

  protected isInvalid(name: string): boolean {
    const control = this.getControl(name);

    return !!(control && this.submitted() && control.invalid);
  }

  protected hasError(name: string, error: string): boolean {
    const control = this.getControl(name);

    return !!(control && this.submitted() && control.hasError(error));
  }

  protected getRequiredMessage(field: FormField): string {
    return field.errorMessages?.required ?? `${field.label} es requerido`;
  }

  protected getPatternMessage(field: FormField): string {
    return field.errorMessages?.pattern ?? `${field.label} no tiene un formato válido`;
  }

  protected getEmailMessage(field: FormField): string {
    return field.errorMessages?.email ?? `Ingrese un correo electrónico válido`;
  }

 protected submitForm(): void {
  this.fields().forEach(field => {
    const control = this.getControl(field.name);

    if (!control) return;

    if (field.type === 'select' && field.options) {
      const option = field.options.find(
        option => option.key === control.value
      );

      if (option) {
        control.setValue(option.value);
      }
    }
  });

  this.submit.emit();
}

  protected cancelForm(): void {
    this.cancel.emit();
  }
}
