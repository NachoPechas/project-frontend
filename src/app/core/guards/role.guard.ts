import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Si el rol actual está dentro de los roles permitidos, dejamos pasar
    if (allowedRoles.includes(authService.currentUserRole())) {
      return true;
    }

    // Si no tiene permiso, lo mandamos al dashboard general
    alert('Acceso denegado: No tienes los permisos necesarios para esta sección.');
    router.navigate(['/dashboard']);
    return false;
  };
};