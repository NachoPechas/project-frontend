import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { handleApiError } from '../api/api-error';

export type UserRole = 'admin' | 'librarian' | 'student';

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  roleId: number;
  role: UserRole;
  roleName?: string;
  status?: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

interface BackendAuthUser {
  id?: number | string;
  nombre?: string;
  name?: string;
  email?: string;
  roleId?: number | string;
  role_id?: number | string;
  roleName?: string;
  role?: string;
  status?: string;
}

interface LoginResponse {
  token?: string;
  user?: BackendAuthUser;
  role?: string;
  rol?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = '/api/auth';
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';

  private readonly token = signal<string | null>(this.getFromStorage(this.tokenKey));
  readonly currentUser = signal<AuthUser | null>(this.getStoredUser());
  readonly currentUserRole = computed<UserRole | null>(() => this.currentUser()?.role ?? null);

  login(credentials: { email: string; password: string }): Observable<AuthSession> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      map((response) => this.toSession(response)),
      tap((session) => this.persistSession(session)),
      catchError(handleApiError('No se pudo iniciar sesion'))
    );
  }

  logout(redirect = true): void {
    this.removeFromStorage(this.tokenKey);
    this.removeFromStorage(this.userKey);
    this.token.set(null);
    this.currentUser.set(null);

    if (redirect) {
      void this.router.navigate(['/login']);
    }
  }

  authToken(): string | null {
    return this.token();
  }

  isAuthenticated(): boolean {
    return Boolean(this.authToken() && this.currentUserRole());
  }

  isAdmin(): boolean {
    return this.currentUserRole() === 'admin';
  }

  isLibrarian(): boolean {
    return this.currentUserRole() === 'librarian';
  }

  isStudent(): boolean {
    return this.currentUserRole() === 'student';
  }

  isStaff(): boolean {
    return this.isAdmin() || this.isLibrarian();
  }

  private toSession(response: LoginResponse): AuthSession {
    if (!response.token) {
      throw new Error('El backend no devolvio token de autenticacion.');
    }

    return {
      token: response.token,
      user: this.normalizeUser(response),
    };
  }

  private normalizeUser(response: LoginResponse): AuthUser {
    const decodedUser = this.decodeToken(response.token);
    const source = response.user ?? decodedUser ?? {};
    const role = this.resolveRole(source.roleId ?? source.role_id, source.roleName ?? source.role, response.role ?? response.rol);

    if (!role) {
      throw new Error('El backend no devolvio un rol valido para la sesion.');
    }

    const roleId = Number(source.roleId ?? source.role_id ?? this.roleIdFromRole(role));
    const email = String(source.email ?? '');

    return {
      id: Number(source.id ?? 0),
      nombre: String(source.nombre ?? source.name ?? email),
      email,
      roleId,
      role,
      roleName: source.roleName,
      status: source.status,
    };
  }

  private persistSession(session: AuthSession): void {
    this.setInStorage(this.tokenKey, session.token);
    this.setInStorage(this.userKey, JSON.stringify(session.user));
    this.token.set(session.token);
    this.currentUser.set(session.user);
  }

  private getStoredUser(): AuthUser | null {
    const rawUser = this.getFromStorage(this.userKey);

    if (!rawUser) {
      return null;
    }

    try {
      const user = JSON.parse(rawUser) as AuthUser;
      return this.isKnownRole(user.role) ? user : null;
    } catch {
      return null;
    }
  }

  private decodeToken(token?: string): BackendAuthUser | null {
    if (!token || typeof atob === 'undefined') {
      return null;
    }

    const [, payload] = token.split('.');

    if (!payload) {
      return null;
    }

    try {
      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(normalizedPayload)) as BackendAuthUser;
    } catch {
      return null;
    }
  }

  private resolveRole(roleId: unknown, roleName: unknown, rawRole: unknown): UserRole | null {
    const numericRoleId = Number(roleId);

    if (numericRoleId === 1) {
      return 'admin';
    }

    if (numericRoleId === 2) {
      return 'librarian';
    }

    if (numericRoleId === 3) {
      return 'student';
    }

    const roleText = String(rawRole ?? roleName ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (roleText.includes('admin')) {
      return 'admin';
    }

    if (roleText.includes('bibliotec')) {
      return 'librarian';
    }

    if (roleText.includes('student') || roleText.includes('estudiante')) {
      return 'student';
    }

    return null;
  }

  private roleIdFromRole(role: UserRole): number {
    if (role === 'admin') {
      return 1;
    }

    if (role === 'librarian') {
      return 2;
    }

    return 3;
  }

  private isKnownRole(role: unknown): role is UserRole {
    return role === 'admin' || role === 'librarian' || role === 'student';
  }

  private getFromStorage(key: string): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem(key);
  }

  private setInStorage(key: string, value: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  private removeFromStorage(key: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
}
