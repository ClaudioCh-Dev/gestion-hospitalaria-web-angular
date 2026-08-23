import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';

import { TuiAnimated } from '@taiga-ui/cdk';
import {
  TuiButton,
  TuiLoader,
} from '@taiga-ui/core';
import {
  TuiAvatar,
  TuiNotificationMiddle,
} from '@taiga-ui/kit';

import { NotificationService } from '../../services/alert-notification-service/alert-notification-service';
import { getProblemMessage } from '../error/error-get-function';

@Component({
  selector: 'app-alert-notification',
  imports: [
    TuiAnimated,
    TuiAvatar,
    TuiLoader,
    TuiNotificationMiddle,
  ],
  templateUrl: './alert-notification.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertNotification {

  protected readonly notificationService =
    inject(NotificationService);

  protected readonly open =
    this.notificationService.open;

  protected readonly problem =
    this.notificationService.problem;

  protected readonly status =
    this.notificationService.status;

  protected readonly message =
    this.notificationService.message;

  protected close(): void {
    this.notificationService.close();
  }

  protected messageProblem = computed(() => {
  const error = this.problem();

  if (!error) {
    return 'Ha ocurrido un error inesperado.';
  }

  return getProblemMessage(error.code, error.detail);
});
}