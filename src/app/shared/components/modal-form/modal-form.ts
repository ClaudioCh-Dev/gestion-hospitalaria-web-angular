import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { TuiDay } from '@taiga-ui/cdk';



import {
  TuiButton,
  TuiCalendar,
  TuiCheckbox,
  TuiTextfield,
} from '@taiga-ui/core';

import {
  TuiBadge,
  TuiDataListWrapper,
  TuiInputDate,
  TuiSelect,
} from '@taiga-ui/kit';


export type FormFieldType =
  | 'text'
  | 'email'
  | 'date'
  | 'select'
  | 'checkbox';


export interface FormField {
  name: string;
  label: string;
  placeholder: string;
  type: FormFieldType;

  options?: readonly string[];

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
],

  templateUrl: './modal-form.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalForm {

  readonly form = input.required<FormGroup>();

  readonly fields = input.required<readonly FormField[]>();

  readonly submitted = input(false);

  readonly submit = output<void>();

  readonly cancel = output<void>();


protected getControl(name: string): FormControl {
  return this.form().get(name) as FormControl;
}


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


  protected getRequiredMessage(field: FormField): string {
    return (
      field.errorMessages?.required ??
      `${field.label} es requerido`
    );
  }


  protected getPatternMessage(field: FormField): string {
    return (
      field.errorMessages?.pattern ??
      `${field.label} no tiene un formato válido`
    );
  }


  protected getEmailMessage(field: FormField): string {
    return (
      field.errorMessages?.email ??
      `Ingrese un correo electrónico válido`
    );
  }


  protected submitForm(): void {
    this.submit.emit();
  }


  protected cancelForm(): void {
    this.cancel.emit();
  }
}