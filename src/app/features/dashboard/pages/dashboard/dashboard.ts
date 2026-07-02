import { Component, signal } from '@angular/core';

interface Desk {
  id: string;
  status: 'available' | 'occupied' | 'reserved';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  // Datos simulados para el mapa de escritorios
  desks = signal<Desk[]>([
    { id: 'A12', status: 'available' },
    { id: 'A13', status: 'occupied' },
    { id: 'A14', status: 'available' },
    { id: 'A15', status: 'reserved' },
    { id: 'A16', status: 'available' },
    { id: 'B01', status: 'occupied' },
    { id: 'B02', status: 'occupied' },
    { id: 'B03', status: 'reserved' },
    { id: 'B04', status: 'available' },
    { id: 'B05', status: 'available' },
    { id: 'C01', status: 'available' },
    { id: 'C02', status: 'available' },
    { id: 'C03', status: 'occupied' },
    { id: 'C04', status: 'available' },
  ]);

  selectedDesk = signal<string>('A12');

  selectDesk(id: string) {
    this.selectedDesk.set(id);
  }
}