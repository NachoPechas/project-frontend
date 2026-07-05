import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

interface HistoryItem {
  id: string;
  type: 'Préstamo Libro' | 'Reserva Puesto' | 'Penalización';
  resourceName: string; // Título del libro o ID del escritorio
  date: string;
  status: 'Completado' | 'Activo' | 'Devuelto' | 'Pendiente' | 'Aplicada';
  details: string;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History {
  public authService = inject(AuthService);
  // Filtros interactivos vinculados con NgModel (RF_19)
  selectedType = signal<string>('Todos los tipos');
  startDate = signal<string>('');
  endDate = signal<string>('');

  // Opciones para el selector de tipo de recurso
  resourceTypes = signal(['Todos los tipos', 'Préstamo Libro', 'Reserva Puesto', 'Penalización']);

  // Datos ficticios que simulan el historial completo del estudiante
  historyRecords = signal<HistoryItem[]>([
    {
      id: 'H-101',
      type: 'Reserva Puesto',
      resourceName: 'Desk A12 (Floor 2 - North Wing)',
      date: '2026-07-04',
      status: 'Activo',
      details: 'Franja: Morning Session (10:00 - 14:00)'
    },
    {
      id: 'H-102',
      type: 'Préstamo Libro',
      resourceName: 'Inteligencia Artificial: Un Enfoque Moderno',
      date: '2026-06-28',
      status: 'Devuelto',
      details: 'Devolución a tiempo en el mostrador principal.'
    },
    {
      id: 'H-103',
      type: 'Préstamo Libro',
      resourceName: 'Clean Code: A Handbook of Agile Software',
      date: '2026-06-15',
      status: 'Devuelto',
      details: 'Devolución realizada con 2 días de retraso.'
    },
    {
      id: 'H-104',
      type: 'Penalización',
      resourceName: 'Multa por retraso en devolución',
      date: '2026-06-17',
      status: 'Aplicada',
      details: 'Monto: $5.000 COP - Restringe reservas hasta el pago.'
    },
    {
      id: 'H-105',
      type: 'Reserva Puesto',
      resourceName: 'Desk B04 (Floor 2 - North Wing)',
      date: '2026-05-20',
      status: 'Completado',
      details: 'Uso correcto del cubículo de estudio.'
    },
    {
      id: 'H-106',
      type: 'Préstamo Libro',
      resourceName: 'Breves respuestas a las grandes preguntas',
      date: '2026-05-02',
      status: 'Completado',
      details: 'Préstamo cerrado satisfactoriamente.'
    }
  ]);

  // Lógica de filtrado reactiva en tiempo real (RF_19)
  filteredHistory = computed(() => {
    return this.historyRecords().filter(item => {
      // Filtro por tipo de recurso
      const matchesType = this.selectedType() === 'Todos los tipos' || item.type === this.selectedType();
      
      // Filtro por rango de fechas
      const itemDate = new Date(item.date);
      const matchesStartDate = !this.startDate() || itemDate >= new Date(this.startDate());
      const matchesEndDate = !this.endDate() || itemDate <= new Date(this.endDate());

      return matchesType && matchesStartDate && matchesEndDate;
    });
  });
}