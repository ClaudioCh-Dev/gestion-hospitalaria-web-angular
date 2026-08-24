import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import {ScrollingModule} from '@angular/cdk/scrolling';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  TuiBadge,
  TuiChevron,
  TuiInputDate,
  TuiSelect,
} from '@taiga-ui/kit';

import {
  TuiButton,
  TuiCalendar,
  TuiCheckbox,
  TuiDataList,
  TuiScrollRef,
  TuiTextfield,
} from '@taiga-ui/core';

export type FormFieldType =
  | 'text'
  | 'email'
  | 'date'
  | 'select'
  | 'checkbox';

export interface FormOption {
  value: string;
  id: string | number;
}

export type SimpleOption = string;

export type SelectOption =
  | FormOption
  | SimpleOption;

export interface FormField {
  name: string;
  label: string;
  placeholder: string;
  type: FormFieldType;

  options?: readonly SelectOption[];

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
    ScrollingModule,

    TuiBadge,
    TuiButton,
    TuiCalendar,
    TuiCheckbox,
    TuiChevron,
    TuiDataList,
    TuiInputDate,
    TuiScrollRef,
    TuiSelect,
    TuiTextfield,
  ],

  templateUrl: './modal-form.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalForm {
  protected readonly Math = Math;

  readonly form = input.required<FormGroup>();

  readonly fields =
    input.required<readonly FormField[]>();

  readonly submitted = input(false);

  readonly submit = output<void>();

  readonly cancel = output<void>();

  // =====================================================
  // GET CONTROL
  // =====================================================

  protected getControl(
    name: string,
  ): FormControl {
    return this.form().get(name) as FormControl;
  }

  // =====================================================
  // STRINGIFY
  // =====================================================

  protected stringify(
    field: FormField,
  ): (value: string | number | null) => string {
    return (value) => {
      if (value === null || value === undefined) {
        return '';
      }

      const option = field.options?.find((item) => {
        if (typeof item === 'string') {
          return item === value;
        }

        return item.id === value;
      });

      if (!option) {
        return '';
      }

      return typeof option === 'string'
        ? option
        : option.value;
    };
  }

  // =====================================================
  // OPTION LABEL
  // =====================================================

  protected getOptionLabel(
    option: SelectOption,
  ): string {
    if (typeof option === 'string') {
      return option;
    }

    return option.value;
  }

  // =====================================================
  // OPTION VALUE
  // =====================================================

  protected getOptionValue(
    option: SelectOption,
  ): string | number {
    if (typeof option === 'string') {
      return option;
    }

    return option.id;
  }

  // =====================================================
  // VALIDATION
  // =====================================================

  protected isInvalid(
    name: string,
  ): boolean {
    const control = this.getControl(name);

    return !!(
      control &&
      this.submitted() &&
      control.invalid
    );
  }

  protected hasError(
    name: string,
    error: string,
  ): boolean {
    const control = this.getControl(name);

    return !!(
      control &&
      this.submitted() &&
      control.hasError(error)
    );
  }

  // =====================================================
  // ERROR MESSAGES
  // =====================================================

  protected getRequiredMessage(
    field: FormField,
  ): string {
    return (
      field.errorMessages?.required ??
      `${field.label} es requerido`
    );
  }

  protected getPatternMessage(
    field: FormField,
  ): string {
    return (
      field.errorMessages?.pattern ??
      `${field.label} no tiene un formato válido`
    );
  }

  protected getEmailMessage(
    field: FormField,
  ): string {
    return (
      field.errorMessages?.email ??
      'Ingrese un correo electrónico válido'
    );
  }

  // =====================================================
  // ACTIONS
  // =====================================================

  protected submitForm(): void {
    console.log(
      '📤 FORMULARIO FINAL:',
      this.form().getRawValue(),
    );

    this.submit.emit();
  }

  protected cancelForm(): void {
    this.cancel.emit();
  }
}