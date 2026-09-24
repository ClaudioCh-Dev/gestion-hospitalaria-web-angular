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
  | 'checkbox'
  | 'color';

export interface FormOption {
  value: string;
  id: string | number;
}

export type SimpleOption = string;

// Opción de un campo 'color': classes son las clases Tailwind del círculo de muestra
export interface ColorOption {
  value: string;
  label: string;
  classes: string;
}

export type SelectOption =
  | FormOption
  | SimpleOption;

export interface FormField {
  name: string;
  label: string;
  placeholder: string;
  type: FormFieldType;

  options?: readonly SelectOption[];

  colors?: readonly ColorOption[];

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

  // Columnas de la grilla de campos desde sm (en móvil siempre 1). Modales angostos: 1
  readonly columns = input<1 | 2>(2);

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
  // COLOR
  // =====================================================

  protected selectColor(
    name: string,
    value: string,
  ): void {
    const control = this.getControl(name);

    control.setValue(value);
    control.markAsDirty();
  }

  protected getColorLabel(
    field: FormField,
  ): string {
    const value = this.getControl(field.name)?.value;

    return field.colors?.find((color) => color.value === value)?.label ?? '';
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

    this.submit.emit();
  }

  protected cancelForm(): void {
    this.cancel.emit();
  }
}