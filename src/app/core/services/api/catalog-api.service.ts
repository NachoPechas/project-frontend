import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { handleApiError } from './api-error';
import { ApiResponse, extractData } from './api-response';

export interface CatalogBook {
  id: number;
  title: string;
  author: string;
  category: string;
  status: 'available' | 'occupied';
  coverUrl: string;
  availableItemId?: number;
}

interface BackendBook {
  id: number;
  title: string;
  author: string;
  category?: string | null;
}

interface BackendItem {
  id: number;
  status?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/libros';
  private readonly covers = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=60',
  ];

  getBooks(): Observable<CatalogBook[]> {
    return this.http.get<ApiResponse<BackendBook[]>>(this.apiUrl).pipe(
      map(extractData),
      switchMap((books) => {
        if (!books.length) {
          return of([]);
        }

        return forkJoin(
          books.map((book) => this.getItemsByBook(book.id).pipe(
            map((items) => this.toCatalogBook(book, items)),
            catchError(() => of(this.toCatalogBook(book, [])))
          ))
        );
      }),
      catchError(handleApiError('No se pudo cargar el catalogo'))
    );
  }

  reserveBook(book: CatalogBook): Observable<unknown> {
    if (!book.availableItemId) {
      throw new Error('No hay ejemplares disponibles para este libro.');
    }

    return this.http.post<ApiResponse<unknown>>('/api/prestamos/prestar', {
      itemId: book.availableItemId,
    }).pipe(
      map(extractData),
      catchError(handleApiError('No se pudo reservar el libro'))
    );
  }

  private getItemsByBook(bookId: number): Observable<BackendItem[]> {
    return this.http.get<ApiResponse<BackendItem[]>>(`/api/ejemplares/libro/${bookId}`).pipe(
      map(extractData)
    );
  }

  private toCatalogBook(book: BackendBook, items: BackendItem[]): CatalogBook {
    const availableCopy = items.find((item) => this.normalize(item.status).includes('disponible'));

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      category: book.category || 'Sin categoria',
      status: availableCopy ? 'available' : 'occupied',
      coverUrl: this.covers[Math.abs(book.id) % this.covers.length],
      availableItemId: availableCopy?.id,
    };
  }

  private normalize(value: unknown): string {
    return String(value ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
