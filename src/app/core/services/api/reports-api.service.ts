import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { handleApiError } from './api-error';
import { ApiResponse, extractData } from './api-response';

export interface DashboardReport {
  date: string;
  loans: {
    active: number;
    overdue: number;
  };
  inventory: {
    totalItems: number;
    availableItems: number;
    maintenanceItems: number;
  };
  reservations: {
    activeToday: number;
    noShows: number;
  };
  seats: {
    available: number;
    occupied: number;
  };
  users: {
    suspended: number;
  };
  notifications: {
    pending: number;
  };
}

export interface ReportData {
  id: string;
  type: 'Prestamos' | 'Retrasos' | 'Inventario';
  title: string;
  generatedDate: string;
  recordsCount: number;
  status: 'Listo' | 'Generando';
}

interface LoanReport {
  total: number;
  active: number;
  returned: number;
}

interface DelayReport {
  date: string;
  total: number;
}

interface InventoryReport {
  totalItems: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/reportes';

  getDashboardReport(): Observable<DashboardReport> {
    return this.http.get<ApiResponse<DashboardReport>>(`${this.apiUrl}/dashboard`).pipe(
      map(extractData),
      catchError(handleApiError('No se pudo cargar el dashboard de reportes'))
    );
  }

  getReports(): Observable<ReportData[]> {
    return forkJoin({
      loans: this.http.get<ApiResponse<LoanReport>>(`${this.apiUrl}/prestamos`).pipe(map(extractData)),
      delays: this.http.get<ApiResponse<DelayReport>>(`${this.apiUrl}/retrasos`).pipe(map(extractData)),
      inventory: this.http.get<ApiResponse<InventoryReport>>(`${this.apiUrl}/inventario`).pipe(map(extractData)),
    }).pipe(
      map(({ loans, delays, inventory }) => [
        {
          id: 'REP-PRESTAMOS',
          type: 'Prestamos' as const,
          title: 'Reporte de prestamos',
          generatedDate: new Date().toISOString().slice(0, 10),
          recordsCount: loans.total,
          status: 'Listo' as const,
        },
        {
          id: 'REP-RETRASOS',
          type: 'Retrasos' as const,
          title: 'Reporte de retrasos y multas',
          generatedDate: delays.date,
          recordsCount: delays.total,
          status: 'Listo' as const,
        },
        {
          id: 'REP-INVENTARIO',
          type: 'Inventario' as const,
          title: 'Reporte de inventario',
          generatedDate: new Date().toISOString().slice(0, 10),
          recordsCount: inventory.totalItems,
          status: 'Listo' as const,
        },
      ]),
      catchError(handleApiError('No se pudieron cargar los reportes'))
    );
  }

  runSuspensions(maxNoShows = 3): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>('/api/reservas-puestos/suspensiones', { maxNoShows }).pipe(
      map(extractData),
      catchError(handleApiError('No se pudieron ejecutar las suspensiones'))
    );
  }
}
