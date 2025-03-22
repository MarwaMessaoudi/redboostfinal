import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { Projet } from '../../models/Projet';

interface User {
  id: number;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjetService {
  private apiUrl = 'http://localhost:8085/api/projets';
  private authUrl = 'http://localhost:8085/Auth';

  constructor(private http: HttpClient) {}

  private getHeaders(includeContentType: boolean = true): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    if (includeContentType) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return headers;
  }

  // Authentication Methods
  login(credentials: { email: string; password: string }): Observable<any> {
    const url = `${this.authUrl}/login`;
    return this.http.post<any>(url, credentials, { headers: this.getHeaders(false) }).pipe(
      tap(response => {
        console.log('Login response:', response);
        if (response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
        }
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      }),
      catchError(this.handleError)
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.error('No refresh token available');
      return throwError(() => new Error('Refresh token is missing!'));
    }
    const body = { refreshToken };
    return this.http.post<any>(`${this.authUrl}/refresh`, body, { headers: this.getHeaders() }).pipe(
      tap(response => {
        console.log('Refresh token response:', response);
        if (response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
        }
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      }),
      catchError(error => {
        console.error('Token refresh failed:', error);
        this.logout(); // Clear tokens on refresh failure
        return throwError(() => new Error('Failed to refresh token. Please log in again.'));
      })
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // CRUD Operations
  createProjet(projet: Projet, logoFile: File | null): Observable<Projet> {
    const url = `${this.apiUrl}/AddProjet`;
    const formData = new FormData();
    const projetToSend = { ...projet, founder: undefined };
    formData.append('projet', JSON.stringify(projetToSend));
    if (logoFile) {
      formData.append('logourl', logoFile);
    }
    return this.http.post<Projet>(url, formData, { headers: this.getHeaders(false) }).pipe(
      catchError(this.handleError)
    );
  }

  getAllProjets(): Observable<Projet[]> {
    const url = `${this.apiUrl}/GetAll`;
    return this.http.get<Projet[]>(url, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getProjetById(id: number): Observable<Projet> {
    const url = `${this.apiUrl}/GetProjet/${id}`;
    return this.http.get<Projet>(url, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateProjet(id: number, projet: Projet, logoFile: File | null): Observable<Projet> {
    const url = `${this.apiUrl}/UpdateProjet/${id}`;
    const formData = new FormData();
    const projetToSend = { ...projet, founder: undefined };
    formData.append('projet', JSON.stringify(projetToSend));
    if (logoFile) {
      formData.append('logourl', logoFile);
    }
    return this.http.put<Projet>(url, formData, { headers: this.getHeaders(false) }).pipe(
      catchError(this.handleError)
    );
  }

  deleteProjet(id: number): Observable<string> {
    const url = `${this.apiUrl}/DeleteProjet/${id}`;
    return this.http.delete<string>(url, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getProjetCardByFounderId(founderId: string): Observable<Projet[]> {
    const url = `${this.apiUrl}/Getcardfounder/${founderId}`;
    return this.http.get<Projet[]>(url, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // Invitation-Related Methods
  getPendingInvitations(): Observable<Projet[]> {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('No access token available');
      return throwError(() => new Error('User not authenticated'));
    }

    // Decode token to get email
    const decodedToken = this.decodeToken(token);
    const email = decodedToken?.sub;
    if (!email) {
      console.error('No email found in token');
      return throwError(() => new Error('Invalid token: email not found'));
    }

    const url = `${this.apiUrl}/pending-invitations?email=${encodeURIComponent(email)}`;
    return this.http.get<Projet[]>(url, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Pending invitations response:', response)),
      catchError(this.handleError)
    );
  }

  // Helper method to decode JWT
  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      console.error('Failed to decode token:', e);
      return null;
    }
  }

  inviteCollaborator(projetId: number, userId: number): Observable<Projet> {
    const url = `${this.apiUrl}/${projetId}/invite/${userId}`;
    return this.http.post<Projet>(url, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  acceptInvitation(projetId: number, userId: number): Observable<Projet> {
    const url = `${this.apiUrl}/${projetId}/accept/${userId}`;
    return this.http.post<Projet>(url, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  declineInvitation(projetId: number, userId: number): Observable<Projet> {
    const url = `${this.apiUrl}/${projetId}/decline/${userId}`;
    return this.http.post<Projet>(url, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getEligibleCollaborators(projetId: number): Observable<User[]> {
    const url = `${this.apiUrl}/${projetId}/eligible-collaborators`;
    return this.http.get<User[]>(url, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        if (error.status === 401) {
          return this.refreshToken().pipe(
            switchMap(() => this.http.get<User[]>(url, { headers: this.getHeaders() })),
            catchError(refreshError => {
              console.error('Refresh token failed in getEligibleCollaborators:', refreshError);
              return throwError(() => new Error('Session expired. Please log in again.'));
            })
          );
        }
        return this.handleError(error);
      })
    );
  }

  // Error Handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error(`Erreur HTTP: ${error.status} - ${error.statusText}`, error);
    let errorMessage = 'Une erreur est survenue. Veuillez réessayer plus tard.';
    if (error.status === 401) {
      errorMessage = 'Session expirée. Veuillez vous reconnecter.';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Requête invalide.';
    } else if (error.status === 403) {
      errorMessage = 'Accès interdit.';
    } else if (error.status === 404) {
      errorMessage = 'Ressource non trouvée.';
    } else if (error.status === 500) {
      errorMessage = 'Erreur serveur interne.';
    }
    return throwError(() => new Error(errorMessage));
  }
}