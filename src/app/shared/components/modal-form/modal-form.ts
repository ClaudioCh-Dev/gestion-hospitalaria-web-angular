import {
  ChangeDetectionStrategy,
  Component,
  effect,
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

  /**
   * Nombre del control que almacena
   * el valor real para el backend.
   *
   * Ej:
   * name: 'specialty'
   * valueField: 'specialtyId'
   */
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
  // Inputs
  // =====================================================

  readonly form = input.required<FormGroup>();

  readonly fields = input.required<readonly FormField[]>();

  readonly submitted = input(false);

  // =====================================================
  // Outputs
  // =====================================================

  readonly submit = output<void>();

  readonly cancel = output<void>();

  // =====================================================
  // Constructor
  // =====================================================

  constructor() {
    effect(() => {
      const form = this.form();
      const fields = this.fields();

      console.log('📋 FORM RECIBIDO:', form);

      console.log('📦 VALORES DEL FORM:', form.value);

      console.log('🎯 CONTROLES:', form.controls);

      // Configurar selects
      fields.forEach(field => {
        this.setupSelect(field);
      });
    });
  }

  // =====================================================
  // SELECT
  // =====================================================

  private setupSelect(field: FormField): void {
    // Si no es select, no hacemos nada
    if (
      field.type !== 'select' ||
      !field.valueField ||
      !field.options
    ) {
      return;
    }

    const form = this.form();

    const selectControl = form.get(field.name);

    const valueControl = form.get(field.valueField);

    if (!selectControl || !valueControl) {
      console.warn(
        `⚠️ No se encontraron los controles del select "${field.name}"`
      );

      return;
    }

    // =================================================
    // EDIT MODE
    // =================================================
    //
    // Ejemplo:
    //
    // specialtyId = 3
    //
    // options:
    // { key: 'Dermatología', value: 3 }
    //
    // Entonces:
    //
    // specialty = 'Dermatología'
    //

    const currentValue = valueControl.value;

    if (
      currentValue !== null &&
      currentValue !== undefined
    ) {
      const option = field.options.find(
        option => option.value === currentValue
      );

      if (option) {
        selectControl.setValue(option.key, {
          emitEvent: false,
        });
      }
    }

    // =================================================
    // USER SELECT
    // =================================================
    //
    // Usuario selecciona:
    //
    // specialty = 'Pediatría'
    //
    // Buscamos:
    //
    // { key: 'Pediatría', value: 2 }
    //
    // Y guardamos:
    //
    // specialtyId = 2
    //

    selectControl.valueChanges.subscribe(key => {
      const option = field.options?.find(
        option => option.key === key
      );

      if (!option) {
        return;
      }

      valueControl.setValue(option.value);

      console.log('🔄 SELECT CAMBIADO:', {
        field: field.name,
        key: option.key,
        value: option.value,
      });
    });
  }

  // =====================================================
  // GET CONTROL
  // =====================================================

  protected getControl(name: string): FormControl {
    return this.form().get(name) as FormControl;
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