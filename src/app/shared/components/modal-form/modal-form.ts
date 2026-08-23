import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import { ScrollingModule } from '@angular/cdk/scrolling';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  TuiButton,
  TuiCalendar,
  TuiCheckbox,
  TuiDataList,
  TuiScrollRef,
  TuiTextfield,
} from '@taiga-ui/core';

import {
  TuiBadge,
  TuiChevron,
  TuiInputDate,
  TuiSelect,
} from '@taiga-ui/kit';

export type FormFieldType =
  | 'text'
  | 'email'
  | 'date'
  | 'select'
  | 'checkbox';

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
    TuiSelect,
    TuiTextfield,
    TuiCalendar,
    TuiInputDate,

    ScrollingModule,
    TuiChevron,
    TuiDataList,
    TuiScrollRef,
  ],
  templateUrl: './modal-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalForm {

  protected readonly Math = Math;

  // =====================================================
  // INPUTS
  // =====================================================

  readonly form = input.required<FormGroup>();

  readonly fields = input.required<readonly FormField[]>();

  readonly submitted = input(false);

  // =====================================================
  // OUTPUTS
  // =====================================================

  readonly submit = output<void>();

  readonly cancel = output<void>();

  // =====================================================
  // CONTROLES AUXILIARES DE LOS SELECTS
  // =====================================================

  private readonly selectControls = new Map<
    string,
    FormControl<string>
  >();

  // =====================================================
  // GET CONTROL REAL
  // =====================================================

  protected getControl(name: string): FormControl {
    return this.form().get(name) as FormControl;
  }

  // =====================================================
  // GET CONTROL DEL SELECT
  // =====================================================

  protected getSelectControl(
    field: FormField,
  ): FormControl<string> {

    let control = this.selectControls.get(field.name);

    if (control) {
      return control;
    }

    // Creamos el control auxiliar
    control = new FormControl('', {
      nonNullable: true,
    });

    this.selectControls.set(field.name, control);

    // Control real del formulario
    const realControl = this.form().get(field.name);

    // =================================================
    // EDIT MODE
    // =================================================

    if (realControl && field.options) {

      const currentValue = realControl.value;

      const option = field.options.find(
        option => option.value === currentValue,
      );

      if (option) {
        control.setValue(option.key, {
          emitEvent: false,
        });
      }
    }

    // =================================================
    // CUANDO EL USUARIO CAMBIA EL SELECT
    // =================================================

    control.valueChanges.subscribe(key => {

      const option = field.options?.find(
        option => option.key === key,
      );

      if (!option) {
        return;
      }

      // Guardamos el VALUE REAL
      realControl?.setValue(option.value);

      console.log('🔄 SELECT:', {
        field: field.name,
        key: option.key,
        value: option.value,
      });
    });

    return control;
  }

  // =====================================================
  // VALIDATION
  // =====================================================

  protected isInvalid(name: string): boolean {

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
  // SUBMIT
  // =====================================================

  protected submitForm(): void {

    console.log(
      '📤 FORMULARIO FINAL:',
      this.form().getRawValue(),
    );

    this.submit.emit();
  }

  // =====================================================
  // CANCEL
  // =====================================================

  protected cancelForm(): void {

    this.cancel.emit();
  }
}