import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environment';
import { Auth, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth'; // Import Auth from AngularFire
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8085/Auth';
  isRefreshing = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService,
    private auth: Auth // Inject Firebase Auth
  ) {}

  // Login with email and password
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

  // Refresh the access token
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
          // localStorage.setItem('refreshToken', response.refreshToken);
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

      return this.http.post(`${this.API_URL}/firebase`, loginPayload, {
        withCredentials: true,
      });
    } catch (error) {
      console.error('Google login error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Google Error',
        detail: 'Login failed',
      });
      throw error;
    }
  }

  // Verify the access token
  verifyToken(): Observable<any> {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      return throwError(() => new Error('No access token found'));
    }

    return this.http.get(`${this.API_URL}/verifyToken`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  // Get the access token from localStorage
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Get the user ID from the decoded JWT token
  getUserId(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.userId; // Matches "userId" claim from JwtUtil
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
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

  // Logout the user
  logout(): Observable<any> {
    // Clear tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Call the backend logout endpoint to clear cookies
    return this.http
      .post(`${this.API_URL}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          // Redirect to the landing page after logout
          this.router.navigate(['/landing']);
        }),
        catchError((error) => {
          console.error('Logout failed:', error);
          return throwError(error);
        })
      );
  }
}