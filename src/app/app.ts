import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service'; // Asegúrate de que la ruta sea la correcta

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html', // Aquí confirmas que está conectado a tu app.html
  styleUrl: './app.css'      // O el nombre de tu archivo de estilos de app
})
export class App { // O el nombre de la clase que tengas ahí
  public authService = inject(AuthService); 
}