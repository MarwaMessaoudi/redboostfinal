import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const authToken = localStorage.getItem('authToken');

  // Handle the request and catch 401 errors
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && !authService.isRefreshing) {
        authService.isRefreshing = true;
        return authService.refreshToken().pipe(
          switchMap((response: any) => {
            authService.isRefreshing = false;
            // Retry the original request
            return next(req);
          }),
          catchError((refreshError) => {
            authService.isRefreshing = false;
            authService.logout(); // Logout if refresh fails
            router.navigate(['/login']);
            return throwError(refreshError);
          })
        );
      }
      return throwError(error);
    })
  );
};