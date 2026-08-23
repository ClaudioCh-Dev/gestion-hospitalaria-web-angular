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

// =====================================================
// TYPES
// =====================================================

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

// =====================================================
// COMPONENT
// =====================================================

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

  readonly fields =
    input.required<readonly FormField[]>();

  readonly submitted = input(false);

  // =====================================================
  // OUTPUTS
  // =====================================================

  readonly submit = output<void>();

  readonly cancel = output<void>();

  // =====================================================
  // CONTROLES AUXILIARES DE LOS SELECTS
  //
  // SOLO SE UTILIZAN PARA:
  //
  // {
  //   key: 'Dermatología',
  //   value: 3
  // }
  //
  // NO SE CREAN PARA:
  //
  // ['Mañana', 'Tarde', 'Noche']
  // =====================================================

  private readonly selectControls =
    new Map<string, FormControl<string>>();

  // =====================================================
  // GET CONTROL REAL
  // =====================================================

  protected getControl(
    name: string,
  ): FormControl {
    return this.form().get(name) as FormControl;
  }

  // =====================================================
  // SABER SI LAS OPCIONES SON KEY/VALUE
  // =====================================================

  protected isKeyValueOptions(
    field: FormField,
  ): boolean {

    const options = field.options;

    if (!options?.length) {
      return false;
    }

    return typeof options[0] === 'object';
  }

  // =====================================================
  // SABER SI LAS OPCIONES SON STRINGS
  // =====================================================

  protected isStringOptions(
    field: FormField,
  ): boolean {

    const options = field.options;

    if (!options?.length) {
      return false;
    }

    return typeof options[0] === 'string';
  }

  // =====================================================
  // GET CONTROL DEL SELECT
  // =====================================================

  protected getSelectControl(
    field: FormField,
  ): FormControl {

    // ===================================================
    // OPCIONES SIMPLES
    //
    // ['Mañana', 'Tarde', 'Noche']
    //
    // NO CREAMOS AUXILIAR
    // ===================================================

    if (this.isStringOptions(field)) {

      return this.getControl(field.name);
    }

    // ===================================================
    // OPCIONES KEY/VALUE
    //
    // [
    //   { key: 'Dermatología', value: 3 },
    //   { key: 'Cardiología', value: 4 }
    // ]
    //
    // AQUÍ SÍ CREAMOS AUXILIAR
    // ===================================================

    let control =
      this.selectControls.get(field.name);

    if (control) {
      return control;
    }

    // ===================================================
    // CREAR CONTROL AUXILIAR
    // ===================================================

    control = new FormControl('', {
      nonNullable: true,
    });

    this.selectControls.set(
      field.name,
      control,
    );

    // ===================================================
    // CONTROL REAL
    // ===================================================

    const realControl =
      this.form().get(field.name);

    // ===================================================
    // EDIT MODE
    //
    // El formulario tiene:
    //
    // specialtyId = 3
    //
    // Pero el SELECT necesita mostrar:
    //
    // Dermatología
    // ===================================================

    if (
      realControl &&
      field.options
    ) {

      const currentValue =
        realControl.value;

      const option = (
        field.options as readonly FormOption[]
      ).find(
        option =>
          option.value === currentValue,
      );

      if (option) {

        control.setValue(
          option.key,
          {
            emitEvent: false,
          },
        );

        console.log(
          '🔄 SELECT INICIALIZADO:',
          {
            field: field.name,
            key: option.key,
            value: option.value,
          },
        );
      }
    }

    // ===================================================
    // CUANDO EL USUARIO CAMBIA EL SELECT
    // ===================================================

    control.valueChanges.subscribe(
      key => {

        const option = (
          field.options as readonly FormOption[]
        ).find(
          option =>
            option.key === key,
        );

        if (!option) {
          return;
        }

        // ===============================================
        // GUARDAMOS EL VALUE REAL
        // ===============================================

        realControl?.setValue(
          option.value,
        );

        console.log(
          '🔄 SELECT KEY/VALUE:',
          {
            field: field.name,
            key: option.key,
            value: option.value,
          },
        );
      },
    );

    return control;
  }

  // =====================================================
  // OBTENER TEXTO DE OPTION
  // =====================================================

  protected getOptionLabel(
    option: SelectOption,
  ): string {

    // ===============================================
    // STRING
    // ===============================================

    if (typeof option === 'string') {
      return option;
    }

    // ===============================================
    // KEY/VALUE
    // ===============================================

    return option.key;
  }

  // =====================================================
  // OBTENER VALUE DE OPTION
  // =====================================================

  protected getOptionValue(
    option: SelectOption,
  ): string {

    // ===============================================
    // STRING
    // ===============================================

    if (typeof option === 'string') {
      return option;
    }

    // ===============================================
    // KEY/VALUE
    // ===============================================

    return option.key;
  }

  // =====================================================
  // VALIDATION
  // =====================================================

  protected isInvalid(
    name: string,
  ): boolean {

    const control =
      this.getControl(name);

    return !!(
      control &&
      this.submitted() &&
      control.invalid
    );
  }

  // =====================================================
  // HAS ERROR
  // =====================================================

  protected hasError(
    name: string,
    error: string,
  ): boolean {

    const control =
      this.getControl(name);

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