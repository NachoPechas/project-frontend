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
onRegister() {
throw new Error('Method not implemented.');
}
  // Inyectamos el servicio de autenticación y el Router de forma moderna
  private authService = inject(AuthService);
  private router = inject(Router);

  // Tus Signals del formulario se quedan exactamente igual
  email = signal('');
  password = signal('');
  errorMessage = signal('');

  onLogin() {
    // 1. Validación básica antes de mandar la petición
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor, llena todos los campos.');
      return;
    }

    // Limpiamos errores anteriores si los hubiera
    this.errorMessage.set('');

    // Emplasticamos los datos para enviárselos al backend
    // Nota: Revisa si tu backend espera "password" o "contrasena" en el JSON
    const credentials = {
      email: this.email(),
      password: this.password() 
    };

    // 2. HACEMOS LA PETICIÓN REAL AL BACKEND DOCKER
    this.authService.login(credentials).subscribe({
      next: (res) => {
        console.log('¡Backend respondió con éxito!', res);
        
        // El servicio guarda el token real y el rol automáticamente en el Signal.
        // Ahora sí, nos vamos al dashboard real.
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error de autenticación:', err);
        
        if (err.status === 401 || err.status === 403) {
          this.errorMessage.set('Correo o contraseña incorrectos.');
        } else if (err.status === 423) {
          this.errorMessage.set('Tu cuenta ha sido bloqueada debido a inasistencias en tus reservas.');
        } else {
          this.errorMessage.set('Error de conexión con el servidor. ¿Docker está encendido?');
        }
      }
    });
  }
}