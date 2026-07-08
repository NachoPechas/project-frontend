import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { handleApiError } from './api-error';
import { ApiResponse, extractData } from './api-response';

export interface TimeSlot {
  id: number;
  session: string;
  hours: string;
}

export interface Desk {
  id: string;
  seatId: number;
  status: 'available' | 'occupied' | 'reserved';
  location: string;
  amenities: string[];
  slots: TimeSlot[];
}

interface BackendTimeSlot {
  id: number;
  startTime?: string | null;
  endTime?: string | null;
}

interface BackendSeat {
  id: number;
  code?: string;
  location?: string | null;
  status?: string | null;
  computers?: number | null;
  remainingMinutes?: number | null;
  availableSlots?: BackendTimeSlot[];
  reservedSlots?: BackendTimeSlot[];
}

interface ReservationPayload {
  seatId: number;
  slotId: number;
  reservationDate: string;
  durationMinutes: number;
}

@Injectable({
  providedIn: 'root'
})
export class StudySeatsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/puestos';
  private readonly reservationsUrl = '/api/reservas-puestos';

  getSeats(date = this.today()): Observable<Desk[]> {
    const params = new HttpParams().set('date', date);

    return this.http.get<ApiResponse<BackendSeat[]>>(this.apiUrl, { params }).pipe(
      map(extractData),
      map((seats) => seats.map((seat) => this.toDesk(seat))),
      catchError(handleApiError('No se pudieron cargar los puestos de estudio'))
    );
  }

  reserveSeat(payload: ReservationPayload): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(this.reservationsUrl, payload).pipe(
      map(extractData),
      catchError(handleApiError('No se pudo reservar el puesto'))
    );
  }

  today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private toDesk(seat: BackendSeat): Desk {
    return {
      id: seat.code || `P-${String(seat.id).padStart(3, '0')}`,
      seatId: seat.id,
      status: this.toStatus(seat.status),
      location: seat.location || 'Ubicacion no registrada',
      amenities: this.toAmenities(seat),
      slots: (seat.availableSlots ?? []).map((slot) => this.toTimeSlot(slot)),
    };
  }

  private toStatus(status: unknown): Desk['status'] {
    const normalizedStatus = String(status ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (normalizedStatus.includes('ocup')) {
      return 'occupied';
    }

    if (normalizedStatus.includes('reserv')) {
      return 'reserved';
    }

    return 'available';
  }

  private toAmenities(seat: BackendSeat): string[] {
    const amenities = ['Wi-Fi'];

    if ((seat.computers ?? 0) > 0) {
      amenities.push(`${seat.computers} computador(es)`);
    }

    if ((seat.remainingMinutes ?? 0) > 0) {
      amenities.push(`${seat.remainingMinutes} min restantes`);
    }

    return amenities;
  }

  private toTimeSlot(slot: BackendTimeSlot): TimeSlot {
    return {
      id: slot.id,
      session: `Franja ${slot.id}`,
      hours: `${this.formatTime(slot.startTime)} - ${this.formatTime(slot.endTime)}`,
    };
  }

  private formatTime(value: string | null | undefined): string {
    if (!value) {
      return '--:--';
    }

    return value.slice(0, 5);
  }
}
