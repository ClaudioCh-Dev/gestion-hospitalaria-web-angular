import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  inject,
} from '@angular/core';

import {
  TuiNotificationOptions,
  TuiNotificationService,
} from '@taiga-ui/core';

import { TuiPortalContext } from '@taiga-ui/cdk';

import {
  injectContext,
  PolymorpheusComponent,
} from '@taiga-ui/polymorpheus';

@Component({
  template: `
    <span tuiSubtitle>
      {{ context.data }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class NotificationContent {
  protected readonly context =
    injectContext<
      TuiPortalContext<
        TuiNotificationOptions<string>,
        void
      >
    >();
}

@Injectable({
  providedIn: 'root',
})
export class NotificationInfoService {

  private readonly notifications =
    inject(TuiNotificationService);

  success(message: string): void {
    this.open(
      message,
      'Éxito',
      'positive',
    );
  }

  error(message: string): void {
    this.open(
      message,
      'Error',
      'negative',
    );
  }

  warning(message: string): void {
    this.open(
      message,
      'Advertencia',
      'warning',
    );
  }

  info(message: string): void {
    this.open(
      message,
      'Información',
      'info',
    );
  }

  private open(
    message: string,
    label: string,
    appearance:
      | 'positive'
      | 'negative'
      | 'warning'
      | 'info',
  ): void {

    this.notifications
      .open<string>(
        new PolymorpheusComponent(
          NotificationContent,
        ),
        {
          label,
          data: message,
          appearance,
          autoClose: 5000,
        },
      )
      .subscribe();
  }
}