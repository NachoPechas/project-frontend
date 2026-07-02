import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule], // Requisito para usar [(ngModel)]
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  // Usamos Signals de Angular para manejar los datos de manera moderna
  email = signal('');
  password = signal('');
  errorMessage = signal('');

  constructor(private router: Router) {}

  onLogin() {
    // Validación súper básica antes de simular
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor, llena todos los campos.');
      return;
    }

    // SIMULACIÓN: Guardamos un token falso en el navegador
    localStorage.setItem('token', 'un-token-falso-bien-melo-123');
    
    // Nos redirige mágicamente al dashboard
    this.router.navigate(['/dashboard']);
  }
}