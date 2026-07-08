import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { handleApiError } from './api-error';
import { ApiResponse, extractData } from './api-response';

export type BookCopyStatus = 'Available' | 'On Loan' | 'In Maintenance';
export type BookCopyCondition = 'Excellent' | 'Good' | 'Damaged';

export interface BookCopy {
  id: number;
  copyCode: string;
  title: string;
  author: string;
  status: BookCopyStatus;
  physicalCondition: BookCopyCondition;
}

interface BackendBook {
  title?: string | null;
  author?: string | null;
}

interface BackendItem {
  id: number;
  bookId?: number;
  description?: string | null;
  status?: string | null;
  physicalCondition?: string | null;
  book?: BackendBook | null;
}

@Injectable({
  providedIn: 'root'
})
export class ResourcesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/ejemplares';

  getCopies(): Observable<BookCopy[]> {
    return this.http.get<ApiResponse<BackendItem[]>>(this.apiUrl).pipe(
      map(extractData),
      map((items) => items.map((item) => this.toBookCopy(item))),
      catchError(handleApiError('No se pudieron cargar los ejemplares'))
    );
  }

  getCopyStatus(identifier: string): Observable<BookCopy> {
    return this.http.get<ApiResponse<BackendItem>>(`${this.apiUrl}/estado/${identifier}`).pipe(
      map(extractData),
      map((item) => this.toBookCopy(item)),
      catchError(handleApiError('No se pudo consultar el ejemplar'))
    );
  }

  updatePhysicalCondition(id: number, condition: BookCopyCondition): Observable<BookCopy> {
    return this.http.patch<ApiResponse<BackendItem>>(`${this.apiUrl}/${id}/estado-fisico`, {
      physicalCondition: this.toBackendCondition(condition),
    }).pipe(
      map(extractData),
      map((item) => this.toBookCopy(item)),
      catchError(handleApiError('No se pudo actualizar el estado fisico'))
    );
  }

  private toBookCopy(item: BackendItem): BookCopy {
    return {
      id: item.id,
      copyCode: `BK-${String(item.id).padStart(3, '0')}`,
      title: item.book?.title || item.description || `Ejemplar ${item.id}`,
      author: item.book?.author || 'Autor no registrado',
      status: this.toStatus(item.status),
      physicalCondition: this.toCondition(item.physicalCondition),
    };
  }

  private toStatus(status: unknown): BookCopyStatus {
    const normalizedStatus = this.normalize(status);

    if (normalizedStatus.includes('prestado')) {
      return 'On Loan';
    }

    if (normalizedStatus.includes('mantenimiento')) {
      return 'In Maintenance';
    }

    return 'Available';
  }

  private toCondition(condition: unknown): BookCopyCondition {
    const normalizedCondition = this.normalize(condition);

    if (
      normalizedCondition.includes('danado') ||
      normalizedCondition.includes('malo') ||
      normalizedCondition.includes('roto') ||
      normalizedCondition.includes('deteriorado')
    ) {
      return 'Damaged';
    }

    if (normalizedCondition.includes('excelente')) {
      return 'Excellent';
    }

    return 'Good';
  }

  private toBackendCondition(condition: BookCopyCondition): string {
    if (condition === 'Excellent') {
      return 'Excelente';
    }

    if (condition === 'Damaged') {
      return 'Danado';
    }

    return 'Bueno';
  }

  private normalize(value: unknown): string {
    return String(value ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
