import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { DoctorService } from '../services/doctor.service';
import { SpecialtyResponse } from '../intefaces';

@Injectable({
  providedIn: 'root',
})
export class SpecialtyStore {
  private readonly doctorService = inject(DoctorService);

  private readonly _specialties = signal<SpecialtyResponse[]>([]);

  readonly specialties = this._specialties.asReadonly();

  private loaded = false;

  async load(): Promise<void> {
    if (this.loaded) {
      return;
    }

    const specialties = await firstValueFrom(
      this.doctorService.findAllSpecialties(),
    );

    this._specialties.set(specialties);
    this.loaded = true;
  }
}