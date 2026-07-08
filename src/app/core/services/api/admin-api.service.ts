import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { handleApiError } from './api-error';
import { ApiResponse, extractData } from './api-response';

export interface UserSession {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
  status: 'Activo' | 'Bloqueado';
  roleId: number;
  hasActiveBooking: boolean;
  activeBookingDetails?: string;
}

interface BackendUser {
  id: number;
  nombre?: string | null;
  name?: string | null;
  email?: string | null;
  roleId?: number | null;
  status?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/usuarios';

  getUsers(): Observable<UserSession[]> {
    return this.http.get<ApiResponse<BackendUser[]>>(this.apiUrl).pipe(
      map(extractData),
      map((users) => users.map((user) => this.toUserSession(user))),
      catchError(handleApiError('No se pudieron cargar los usuarios'))
    );
  }

  private toUserSession(user: BackendUser): UserSession {
    const name = user.nombre || user.name || 'Usuario sin nombre';

    return {
      id: user.id,
      name,
      email: user.email || 'Sin correo',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E2E8F0&color=0F172A`,
      status: this.normalize(user.status).includes('suspend') ? 'Bloqueado' : 'Activo',
      roleId: Number(user.roleId ?? 3),
      hasActiveBooking: false,
    };
  }

  private normalize(value: unknown): string {
    return String(value ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
