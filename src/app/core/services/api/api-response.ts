export interface ApiResponse<T> {
  ok?: boolean;
  success?: boolean;
  message?: string;
  mensaje?: string;
  error?: string;
  count?: number;
  data: T;
}

export function extractData<T>(response: ApiResponse<T>): T {
  return response.data;
}
