import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const DEBUG = true;
  const token = typeof localStorage === 'undefined'
    ? null
    : localStorage.getItem('auth_token');

  const isApiRequest = req.url.startsWith('/api') || req.url.includes('localhost:3000/api');

  if (DEBUG) {
    console.log('[AuthInterceptor] Request:', {
      url: req.url,
      method: req.method,
      hasToken: Boolean(token),
      isApiRequest,
    });
  }

  if (!token || !isApiRequest) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (DEBUG) {
    console.log('[AuthInterceptor] Headers añadidos:', authReq.headers.get('Authorization'));
  }

  return next(authReq);
};
