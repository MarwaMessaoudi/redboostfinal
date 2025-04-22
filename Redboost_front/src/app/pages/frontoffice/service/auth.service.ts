import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../../../environment';
import { Auth, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth'; // Import Auth from AngularFire
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly API_URL = 'http://localhost:8085/Auth';
    isRefreshing = false; // Add this property

    constructor(
        private http: HttpClient,
        private router: Router,
        private messageService: MessageService,
        private auth: Auth // Inject Firebase Auth
    ) {}

    // auth.service.ts
    login(email: string, password: string): Observable<any> {
        return this.http
            .post(
                `${this.API_URL}/login`,
                { email, password },
                { withCredentials: true } // Include cookies
            )
            .pipe(
                tap((response: any) => {
                    // Store tokens in localStorage for quick access
                    localStorage.setItem('accessToken', response.accessToken);
                    localStorage.setItem('refreshToken', response.refreshToken);
                })
            );
    }

    // auth.service.ts
    // auth.service.ts
    refreshToken(): Observable<any> {
        const refreshToken = localStorage.getItem('refreshToken');

        return this.http
            .post(
                `${this.API_URL}/refresh`,
                { refreshToken }, // Send refresh token in the request body
                { withCredentials: true } // Include cookies
            )
            .pipe(
                tap((response: any) => {
                    // Store the new access token in localStorage
                    localStorage.setItem('accessToken', response.accessToken);
                    //localStorage.setItem('refreshToken', response.refreshToken);
                })
            );
    }

    // Google Login using the new modular Firebase SDK
    async googleLogin(selectedRole: string): Promise<Observable<any>> {
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });

            const result = await signInWithPopup(this.auth, provider);
            const idToken = await result.user?.getIdToken();

            console.log('Firebase ID Token:', idToken);

            const loginPayload = { idToken, role: selectedRole };

            return this.http.post(`${this.API_URL}/firebase`, loginPayload, { withCredentials: true });
        } catch (error) {
            console.error('Google login error:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Google Error',
                detail: 'Login failed'
            });
            throw error;
        }
    }

    // Get the user role from the decoded JWT token
    getUserRole(): string | null {
        const token = this.getToken();
        if (!token) {
            return null;
        }
        try {
            const decodedToken: any = jwtDecode(token);
            return decodedToken.role; // Matches "role" claim from JwtUtil
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }
    verifyToken(): Observable<any> {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            return throwError(() => new Error('No access token found'));
        }

        return this.http.get(`${this.API_URL}/verifyToken`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
    }

    getToken(): string | null {
        return localStorage.getItem('accessToken'); // Retrieve token from localStorage
    }

    getUserId(): string | null {
        const token = this.getToken();
        if (!token) {
            return null;
        }
        try {
            const decodedToken: any = jwtDecode(token);
            return decodedToken.userId; // Matches "userId" claim from JwtUtil
        } catch (error) {
            console.error('Erreur lors du dÃ©codage du token:', error);
            return null;
        }
    }

    /* linkedInLogin(): Observable<any> {
    // Redirect to backend LinkedIn OAuth2 endpoint
    window.location.href = `${this.API_URL}/oauth/login`;
    return new Observable((observer) => {
      observer.next();
    });
  } */

    // auth.service.ts
    logout(): Observable<any> {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return this.http.post(`${this.API_URL}/logout`, {}, { withCredentials: true }).pipe(
            catchError((error) => {
                console.error('Logout failed:', error);
                return throwError(error);
            })
        );
    }

    // Nouvelle méthode pour récupérer l'ID et le rôle de l'utilisateur connecté
    getCurrentUser(): Observable<{ id: number; role: string } | null> {
        const token = this.getToken();
        console.log('Token récupéré:', token);
        if (!token) {
            console.log('Aucun token trouvé dans localStorage');
            return of(null);
        }

        try {
            const decodedToken: any = jwtDecode(token);
            console.log('Token décodé:', decodedToken);
            const userId = decodedToken.userId;
            const role = decodedToken.role;

            if (!userId || !role) {
                console.log('userId ou role manquant dans le token');
                return of(null);
            }

            return of({ id: parseInt(userId, 10), role });
        } catch (error) {
            console.error('Erreur lors du décodage du token:', error);
            return of(null);
        }
    }
}
