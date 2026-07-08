import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = typeof localStorage === 'undefined'
    ? null
    : localStorage.getItem('auth_token');

  const isApiRequest = req.url.startsWith('/api') || req.url.includes('localhost:3000/api');

  if (!token || !isApiRequest) {
    return next(req);
  }

  return next(req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  }));
};
