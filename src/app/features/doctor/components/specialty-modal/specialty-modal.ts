import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';

import { NotificationService } from '@core/services/alert-notification.service';
import { FormField, ModalForm } from '@shared/components/modal-form/modal-form';
import { withNotification } from '@shared/operators/with-notification';

import { SpecialtyResponse } from '../../interfaces';
import { DoctorService } from '../../services/doctor.service';
import { SpecialtyStore } from '../../store/specialty.store';

@Component({
  selector: 'app-specialty-modal',
  imports: [ModalForm],
  template: `
    <app-modal-form
      [form]="form"
      [fields]="fields"
      [submitted]="submitted()"
      (submit)="save()"
      (cancel)="cancel()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecialtyModal {
  private readonly context = injectContext<TuiDialogContext<SpecialtyResponse | null>>();

  private readonly doctorService = inject(DoctorService);
  private readonly specialtyStore = inject(SpecialtyStore);
  private readonly notificationService = inject(NotificationService);

  protected readonly submitted = signal(false);

  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)],
    }),

    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly fields: FormField[] = [
    {
      name: 'name',
      label: 'Nombre',
      placeholder: 'Ej. Cardiología',
      type: 'text',
      errorMessages: {
        required: 'El nombre es requerido',
        pattern: 'Solo se permiten letras',
      },
    },
    {
      name: 'description',
      label: 'Descripción',
      placeholder: 'Ingrese una descripción',
      type: 'text',
      errorMessages: { required: 'La descripción es requerida' },
    },
  ];

  protected save(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.doctorService
      .createSpecialty(this.form.getRawValue())
      .pipe(
        withNotification(this.notificationService, {
          success: 'Especialidad creada correctamente',
        }),
      )
      .subscribe({
        next: (specialty) => {
          this.specialtyStore.add(specialty);
          this.context.completeWith(specialty);
        },
      });
  }

  protected cancel(): void {
    this.context.completeWith(null);
  }
}
