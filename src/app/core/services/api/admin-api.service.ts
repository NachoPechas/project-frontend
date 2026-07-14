import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { handleApiError } from './api-error';
import { ApiResponse, extractData } from './api-response';
import { AuthService } from '../../services/auth/auth.service';

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
  private readonly DEBUG = true;
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = '/api/usuarios';

  getUsers(): Observable<UserSession[]> {
    return this.http.get<ApiResponse<BackendUser[]>>(this.apiUrl).pipe(
      map(extractData),
      map((users) => users.map((user) => this.toUserSession(user))),
      catchError(handleApiError('No se pudieron cargar los usuarios'))
    );
  }

  updateUserStatus(id: number, status: 'Activo' | 'Suspendido'): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { status }, { headers: this.authHeaders() }).pipe(
      catchError(handleApiError('Error al cambiar el estado del usuario'))
    );
  }

  registerUser(payload: { nombre: string; email: string; password: string; confirmPassword: string; role: string; }): Observable<any> {
    const url = `${this.apiUrl}/registro`;
    const headers = this.authHeaders();

    if (this.DEBUG) {
      console.log('[AdminApiService] Enviando registro a:', url);
      console.log('[AdminApiService] Headers:', headers.keys().reduce((acc, key) => ({ ...acc, [key]: headers.get(key) }), {}));
    }

    return this.http.post(url, payload, { headers }).pipe(
      tap((response) => {
        if (this.DEBUG) {
          console.log('[AdminApiService] Respuesta HTTP del registro:', response);
        }
      }),
      catchError((error) => {
        if (this.DEBUG) {
          console.error('[AdminApiService] Error HTTP del registro:', {
            status: error?.status,
            message: error?.message,
            body: error?.error,
          });
        }
        return handleApiError('No se pudo registrar el usuario')(error);
      })
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

  private authHeaders(): HttpHeaders {
    const token = this.authService.authToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
