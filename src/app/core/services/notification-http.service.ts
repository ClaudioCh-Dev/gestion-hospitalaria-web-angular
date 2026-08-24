import { ChangeDetectionStrategy, Component, Injectable, inject } from '@angular/core';

import { TuiNotificationService } from '@taiga-ui/core';

import { injectContext, PolymorpheusComponent } from '@taiga-ui/polymorpheus';

import { ProblemDetailMicroservice } from '@shared/models/problem.type';
import { TuiPortalContext } from '@taiga-ui/cdk';

interface HttpNotificationContext {
  data: ProblemDetailMicroservice;
}
// =====================================================
// HTTP ERROR CONTENT
// =====================================================

@Component({
  template: `
    <div class="flex flex-col gap-1">

      @if (context.data.detail) {
        <span>
          {{ context.data.detail }}
        </span>
      }

      <div class="text-xs opacity-70">
        <div>Status: {{ context.data.status }}</div>

        @if (context.data.code) {
          <div>Código: {{ context.data.code }}</div>
        }

        @if (context.data.type) {
          <div>Tipo: {{ context.data.type }}</div>
        }

        @if (context.data.instance) {
          <div>Instance: {{ context.data.instance }}</div>
        }
      </div>
    </div>
  `,

  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HttpNotificationContent {

    protected readonly context =
    injectContext<HttpNotificationContext>();
}

// =====================================================
// SERVICE
// =====================================================

@Injectable({
  providedIn: 'root',
})
export class NotificationHttpService {
  private readonly notifications = inject(TuiNotificationService);

  // =====================================================
  // HTTP ERROR
  // =====================================================

  httpError(problem: ProblemDetailMicroservice): void {
    console.log('🚨 NotificationHttpService recibió:', problem);

    this.notifications
      .open(new PolymorpheusComponent(HttpNotificationContent), {
        label: problem.title ?? 'Error',

        data: problem,

        appearance: 'negative',

        autoClose: 5000,
      })
      .subscribe();
  }
}
