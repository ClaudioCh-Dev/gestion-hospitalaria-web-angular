import { Injectable, signal } from '@angular/core';

import { ProblemDetailMicroservice } from '../../shared/models/problem.type';

export type NotificationStatus = 'loading' | 'success' | 'error';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  readonly open = signal(false);

  readonly status = signal<NotificationStatus>('loading');

  readonly message = signal('');

  readonly problem = signal<ProblemDetailMicroservice | null>(null);

  showLoading(): void {
    this.status.set('loading');
    this.message.set('');
    this.problem.set(null);
    this.open.set(true);
  }

  showSuccess(message: string): void {
    this.status.set('success');
    this.message.set(message);
    this.problem.set(null);
    this.open.set(true);
  }

  showError(problem: ProblemDetailMicroservice): void {
    console.log('Error:', problem);
    this.status.set('error');
    this.problem.set(problem);
    this.message.set('');
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
    this.problem.set(null);
    this.message.set('');
  }
}
