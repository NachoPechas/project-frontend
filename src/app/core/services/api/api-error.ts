import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

interface BackendErrorBody {
  message?: string;
  mensaje?: string;
  error?: string;
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No se pudo conectar con el backend. Verifica que Docker este corriendo en http://localhost:3000.';
    }

    const body = error.error as BackendErrorBody | string | null;

    if (typeof body === 'string') {
      return body;
    }

    if (body?.message) {
      return body.message;
    }

    if (body?.mensaje) {
      return body.mensaje;
    }

    if (body?.error) {
      return body.error;
    }

    return `Error HTTP ${error.status}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrio un error inesperado.';
}

export function handleApiError(operation: string) {
  return (error: unknown) => throwError(() => new Error(`${operation}: ${getApiErrorMessage(error)}`));
}
