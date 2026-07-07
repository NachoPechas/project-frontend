import { Injectable, signal } from '@angular/core';

export type UserRole = 'student' | 'admin';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Signal que almacena el rol del usuario actual (puedes cambiarlo aquí para probar)
  currentUserRole = signal<UserRole>('admin'); 

  // Métodos rápidos para verificar el rol
  isAdmin(): boolean {
    return this.currentUserRole() === 'admin';
  }

  isStudent(): boolean {
    return this.currentUserRole() === 'student';
  }

  // Método para simular un cambio de rol (para tus pruebas en el frontend)
  switchRole(role: UserRole) {
    this.currentUserRole.set(role);
  }
}