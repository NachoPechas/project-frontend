import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);
  export router = inject(Router); // Público para usarlo directo en el HTML si prefieres

  // Signals para capturar el formulario
  name = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  
  errorMessage = signal('');
  successMessage = signal('');

  onRegister() {
    // 1. Validación básica de campos vacíos
    if (!this.name() || !this.email() || !this.password() || !this.confirmPassword()) {
      this.errorMessage.set('Por favor, llena todos los campos.');
      return;
    }

    // 2. Validación de contraseñas idénticas
    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    // Estructura del JSON lista para tu Node.js
    const userData = {
      name: this.name(),
      email: this.email(),
      password: this.password()
    };

    // 3. LLAMADA PREPARADA PARA TU BACKEND
    this.authService.register(userData).subscribe({
      next: (res) => {
        console.log('¡Usuario registrado en Node.js con éxito!', res);
        this.successMessage.set('¡Registro exitoso! Redirigiendo al login...');
        
        // Esperamos 2 segundos para que el usuario lea el éxito y lo mandamos al Login
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error en el registro:', err);
        if (err.status === 409) {
          this.errorMessage.set('Este correo electrónico ya está registrado.');
        } else {
          this.errorMessage.set('No se pudo completar el registro. Inténtalo más tarde.');
        }
      }
    });
  }
}