import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../service/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Skip interceptor for login and confirm-email endpoints
    if (req.url.includes('/Auth/login') || req.url.includes('/Auth/confirm-email')) {
        console.log(`Skipping AuthInterceptor for ${req.url}`);
        return next(req);
    }

    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${accessToken}`
            }
        });
    }

    return next(req).pipe(
        catchError((error) => {
            if (error.status === 401 && !authService.isRefreshing) {
                authService.isRefreshing = true;

                return authService.refreshToken().pipe(
                    switchMap((response: any) => {
                        localStorage.setItem('accessToken', response.accessToken);
                        authService.isRefreshing = false;

                        const newReq = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${response.accessToken}`
                            }
                        });

                        return next(newReq);
                    }),
                    catchError((refreshError) => {
                        authService.isRefreshing = false;
                        authService.logout().subscribe(() => {
                            router.navigate(['/landing']);
                        });
                        return throwError(() => refreshError);
                    })
                );
            }
            return throwError(() => error);
        })
    );
};
