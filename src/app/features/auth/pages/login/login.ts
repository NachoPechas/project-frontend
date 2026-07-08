
import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'; 
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = signal('');
  password = signal('');
  errorMessage = signal('');

  onLogin(): void {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor, llena todos los campos.');
      return;
    }
    
    this.errorMessage.set('');

    this.authService.login({
      email: this.email(),
      password: this.password(),
    }).subscribe({
      next: () => {
        void this.router.navigate(['/dashboard']);
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.toLoginErrorMessage(error));
      },
    });
  }

  private toLoginErrorMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error ?? '');
    const normalized = message
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (normalized.includes('conectar') || normalized.includes('status 0')) {
      return 'Error de conexion con el servidor. Verifica que el backend este corriendo en http://localhost:3000.';
    }

    if (normalized.includes('bloqueada') || normalized.includes('bloqueado') || normalized.includes('423')) {
      return 'Tu cuenta esta bloqueada temporalmente.';
    }

    if (
      normalized.includes('incorrect') ||
      normalized.includes('credenciales') ||
      normalized.includes('401') ||
      normalized.includes('403')
    ) {
      return 'Correo o contrasena incorrectos.';
    }

    return message || 'No se pudo iniciar sesion.';
  }
}
