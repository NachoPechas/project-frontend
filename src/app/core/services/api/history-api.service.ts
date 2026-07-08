import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { handleApiError } from './api-error';
import { ApiResponse, extractData } from './api-response';

export interface HistoryFilters {
  from?: string;
  to?: string;
  type?: 'all' | 'loans' | 'reservations';
  userId?: number | null;
}

export interface HistoryItem {
  id: string;
  type: 'Prestamo Libro' | 'Reserva Puesto' | 'Penalizacion';
  typeClass: 'loan' | 'reservation' | 'penalty';
  resourceName: string;
  date: string;
  status: 'Completado' | 'Activo' | 'Devuelto' | 'Pendiente' | 'Aplicada';
  details: string;
}

interface BackendHistoryRecord {
  type: 'loan' | 'reservation';
  date: string;
  data: BackendLoan | BackendReservation;
}

interface BackendLoan {
  id: number;
  itemId: number;
  loanDate: string;
  dueDate: string;
  returnDate?: string | null;
  item?: {
    id: number;
    book?: {
      title?: string | null;
      author?: string | null;
    } | null;
  } | null;
  penalties?: BackendPenalty[];
}

interface BackendPenalty {
  id: number;
  amount?: string | number | null;
  reason?: string | null;
  status?: string | null;
  createdDate?: string | null;
}

interface BackendReservation {
  id: number;
  seatId: number;
  slotId: number;
  reservationDate: string;
  status?: string | null;
  seat?: {
    id: number;
    location_details?: string | null;
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryApiService {
  private readonly http = inject(HttpClient);

  getHistory(filters: HistoryFilters = {}): Observable<HistoryItem[]> {
    let params = new HttpParams();

    if (filters.from) {
      params = params.set('from', filters.from);
    }

    if (filters.to) {
      params = params.set('to', filters.to);
    }

    if (filters.type && filters.type !== 'all') {
      params = params.set('type', filters.type);
    }

    const url = filters.userId
      ? `/api/prestamos/historial/${filters.userId}`
      : '/api/prestamos/historial/mio';

    return this.http.get<ApiResponse<BackendHistoryRecord[]>>(url, { params }).pipe(
      map(extractData),
      map((records) => records.flatMap((record) => this.toHistoryItems(record))),
      catchError(handleApiError('No se pudo cargar el historial'))
    );
  }

  private toHistoryItems(record: BackendHistoryRecord): HistoryItem[] {
    if (record.type === 'loan') {
      return this.loanToItems(record.data as BackendLoan);
    }

    return [this.reservationToItem(record.data as BackendReservation)];
  }

  private loanToItems(loan: BackendLoan): HistoryItem[] {
    const book = loan.item?.book;
    const loanItem: HistoryItem = {
      id: `L-${loan.id}`,
      type: 'Prestamo Libro',
      typeClass: 'loan',
      resourceName: book?.title || `Ejemplar ${loan.itemId}`,
      date: loan.loanDate,
      status: loan.returnDate ? 'Devuelto' : 'Activo',
      details: loan.returnDate
        ? `Devuelto el ${loan.returnDate}.`
        : `Vence el ${loan.dueDate}. ${book?.author ? `Autor: ${book.author}.` : ''}`,
    };

    const penalties = (loan.penalties ?? []).map((penalty) => this.penaltyToItem(penalty, loan.id));
    return [loanItem, ...penalties];
  }

  private reservationToItem(reservation: BackendReservation): HistoryItem {
    return {
      id: `R-${reservation.id}`,
      type: 'Reserva Puesto',
      typeClass: 'reservation',
      resourceName: `Puesto ${reservation.seat?.id ?? reservation.seatId}`,
      date: reservation.reservationDate,
      status: this.toReservationStatus(reservation.status),
      details: `Franja ${reservation.slotId}. ${reservation.seat?.location_details ?? 'Ubicacion no registrada.'}`,
    };
  }

  private penaltyToItem(penalty: BackendPenalty, loanId: number): HistoryItem {
    return {
      id: `P-${penalty.id}`,
      type: 'Penalizacion',
      typeClass: 'penalty',
      resourceName: `Penalizacion de prestamo L-${loanId}`,
      date: penalty.createdDate || '',
      status: this.normalize(penalty.status).includes('pag') ? 'Completado' : 'Aplicada',
      details: `${penalty.reason || 'Penalizacion registrada.'} Monto: ${penalty.amount ?? 0} COP.`,
    };
  }

  private toReservationStatus(status: unknown): HistoryItem['status'] {
    const normalizedStatus = this.normalize(status);

    if (normalizedStatus.includes('activa')) {
      return 'Activo';
    }

    if (normalizedStatus.includes('inasistencia')) {
      return 'Aplicada';
    }

    if (normalizedStatus.includes('pend')) {
      return 'Pendiente';
    }

    return 'Completado';
  }

  private normalize(value: unknown): string {
    return String(value ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
