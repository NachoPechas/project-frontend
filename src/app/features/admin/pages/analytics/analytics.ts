import { Component, signal, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { FormsModule } from '@angular/forms';

interface ReportData {
  id: string;
  type: 'Préstamos' | 'Retrasos' | 'Inventario';
  title: string;
  generatedDate: string;
  recordsCount: number;
  status: 'Listo' | 'Generando';
}

interface SuspendedCandidate {
  userId: string;
  name: string;
  missedBookingsCount: number; // Reincidencias de inasistencia
  lastViolationDate: string;
  actionRequired: 'Suspender' | 'Suspendido Temporalmente';
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class Analytics {
  public authService = inject(AuthService);
  // RF_20: Datos en tiempo real para el Panel de Monitoreo (KPIs)
  activeLoansCount = signal(142);
  occupiedDesksPercentage = signal(78);
  pendingFinesTotal = signal(450000); // Pesos COP
  activeUsersCount = signal(320);

  // RF_10: Listado de Reportes Detallados del Sistema
  selectedReportType = signal<string>('Todos');
  reports = signal<ReportData[]>([
    { id: 'REP-001', type: 'Préstamos', title: 'Uso de recursos por facultad - Junio 2026', generatedDate: '2026-07-01', recordsCount: 1240, status: 'Listo' },
    { id: 'REP-002', type: 'Retrasos', title: 'Consolidado de morosos y multas vigentes', generatedDate: '2026-07-03', recordsCount: 45, status: 'Listo' },
    { id: 'REP-003', type: 'Inventario', title: 'Libros más solicitados e índice de rotación', generatedDate: '2026-06-30', recordsCount: 500, status: 'Listo' },
    { id: 'REP-004', type: 'Préstamos', title: 'Ocupación de puestos de estudio por franja horaria', generatedDate: '2026-07-04', recordsCount: 89, status: 'Listo' }
  ]);

  // RF_17: Módulo de Auditoría - Candidatos a suspensión por inasistencias repetidas
  flaggedUsers = signal<SuspendedCandidate[]>([
    { userId: 'U-8824', name: 'Laura Sofía Gómez', missedBookingsCount: 4, lastViolationDate: '2026-07-02', actionRequired: 'Suspender' },
    { userId: 'U-4412', name: 'Esteban Quito', missedBookingsCount: 3, lastViolationDate: '2026-07-03', actionRequired: 'Suspender' },
    { userId: 'U-1092', name: 'Mateo Velásquez', missedBookingsCount: 6, lastViolationDate: '2026-06-25', actionRequired: 'Suspendido Temporalmente' }
  ]);

  // Filtrado reactivo de reportes (RF_10)
  filteredReports = computed(() => {
    if (this.selectedReportType() === 'Todos') return this.reports();
    return this.reports().filter(r => r.type === this.selectedReportType());
  });

  // RF_17: Ejecutar suspensión del sistema
  triggerSuspension(userId: string) {
    this.flaggedUsers.update(users => 
      users.map(u => u.userId === userId ? { ...u, actionRequired: 'Suspendido Temporalmente' } : u)
    );
    alert(`RF_17 - Auditoría: El usuario con ID ${userId} ha sido suspendido temporalmente por reincidencia en faltas.`);
  }
}