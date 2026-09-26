import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';

import { NotificationResponse } from '../interfaces';
import { NotificationApiService } from './notification-api.service';

@Injectable()
export class NotificationApiHttpService implements NotificationApiService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.api.baseUrl}/notifications/crud`;

  findMine(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${this.apiUrl}/me`);
  }

  findForAdmin(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(`${this.apiUrl}/admin`);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/read`, {});
  }
}
