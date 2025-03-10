import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';
import { Auth, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth'; // Import Auth from AngularFire

@Injectable({
  providedIn: 'root',
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

  login(email: string, password: string): Observable<any> {
    return this.http.post(
      `${this.API_URL}/login`,
      { email, password },
      { withCredentials: true } // Include credentials (cookies)
    );
  }

  

  refreshToken(): Observable<any> {
    return this.http.post(`${this.API_URL}/refresh`, {}, { withCredentials: true });
  }

  logout(): void {
    // Clear user state and redirect to login
    this.router.navigate(['/login']);
  }

  // Google Login using the new modular Firebase SDK
  googleLogin(): Observable<any> {
    return new Observable((observer) => {
    const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account", // Force la sélection du compte
});
      signInWithPopup(this.auth, provider) // Use the injected Auth instance
        .then((result) => {
          // Get the ID token from Firebase
          result.user?.getIdToken().then((idToken) => {
            console.log('Firebase ID Token:', idToken); // Debugging

            this.http
              .post(`${this.API_URL}/firebase`, { idToken }, { withCredentials: true })
              .subscribe({
                next: (response) => {
                  observer.next(response);
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Google Login',
                    detail: 'Login successful',
                  });
                  this.router.navigate(['/']);
                },
                error: (error) => {
                  observer.error(error);
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Google Error',
                    detail: 'Login failed',
                  });
                },
              });
          });
        })
        .catch((error) => {
          observer.error(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Google Error',
            detail: 'Login failed',
          });
        });
    });
  }


  linkedInLogin(): Observable<any> {
    // Redirect to backend LinkedIn OAuth2 endpoint
    window.location.href = `${this.API_URL}/oauth/login`;
    return new Observable((observer) => {
      observer.next();
    });
  }









}