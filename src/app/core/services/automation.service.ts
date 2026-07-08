import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { getApiErrorMessage } from './api/api-error';
import { ApiResponse, extractData } from './api/api-response';

export interface NotificationAlert {
  id: string;
  userId: string;
  userName: string;
  type: string;
  message: string;
  date: string;
}

export interface WaitingList {
  resourceId: string;
  resourceName: string;
  usersInLine: { userId: string; userName: string; joinedAt: string; status: string }[];
}

interface BackendNotification {
  id: number;
  userId?: number | null;
  message?: string | null;
  type?: string | null;
  sentDate?: string | null;
  status?: string | null;
  user?: {
    nombre?: string | null;
    email?: string | null;
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class AutomationService {
  private readonly http = inject(HttpClient);

  notifications = signal<NotificationAlert[]>([]);
  waitingLists = signal<WaitingList[]>([]);
  absenteeismDesks = signal<{ id: string; user: string; reservedTime: string; minutesPassed: number; status: string }[]>([]);
  errorMessage = signal('');

  loadNotifications(): void {
    this.errorMessage.set('');

    this.http.get<ApiResponse<BackendNotification[]>>('/api/notificaciones').pipe(
      map(extractData),
      map((notifications) => notifications.map((notification) => this.toNotificationAlert(notification))),
      catchError((error: unknown) => {
        this.errorMessage.set(getApiErrorMessage(error));
        return of([]);
      })
    ).subscribe((notifications) => this.notifications.set(notifications));
  }

  releaseDesk(_deskId: string): void {
    this.http.post<ApiResponse<unknown>>('/api/reservas-puestos/inasistencias', { toleranceMinutes: 15 }).pipe(
      catchError((error: unknown) => {
        this.errorMessage.set(getApiErrorMessage(error));
        return of(null);
      })
    ).subscribe(() => {
      this.absenteeismDesks.set([]);
    });
  }

  confirmOrSkipWaitingList(resourceId: string, userId: string, _confirmed: boolean): void {
    this.waitingLists.update((lists) => lists.map((list) => {
      if (list.resourceId !== resourceId) {
        return list;
      }

      return {
        ...list,
        usersInLine: list.usersInLine.filter((user) => user.userId !== userId),
      };
    }));
  }

  private toNotificationAlert(notification: BackendNotification): NotificationAlert {
    return {
      id: `NT-${notification.id}`,
      userId: notification.userId ? `U-${notification.userId}` : 'U-N/A',
      userName: notification.user?.nombre || notification.user?.email || 'Usuario no registrado',
      type: notification.type || 'Notificacion',
      message: notification.message || 'Sin mensaje',
      date: notification.sentDate ? new Date(notification.sentDate).toLocaleString() : 'Sin fecha',
    };
  }
}
