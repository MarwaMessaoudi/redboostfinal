import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { Projet, Objectives, Statut } from '../../models/Projet'; 

interface User {
  id: number;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

interface PendingInvitation {
  projectId: number;
  projectName: string;
  invitorEmail: string;
  invitorName: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjetService {
  private apiUrl = 'http://localhost:8085/api/projets';
  private currentUserIdSubject = new BehaviorSubject<number | null>(null);
  currentUserId$ = this.currentUserIdSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(includeContentType: boolean = true): HttpHeaders {
    let headers = new HttpHeaders();
    if (includeContentType) {
      headers = headers.set('Content-Type', 'application/json');
    }
    const token = localStorage.getItem('token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  fetchCurrentUserId(): Observable<number> {
    return new Observable<number>(observer => {
      const tokenKey = 'accessToken'; // Align with SigninComponent and AuthInterceptor
      const checkToken = () => {
        const token = localStorage.getItem(tokenKey);
        console.log('fetchCurrentUserId - Token:', token); // Debug log
        if (!token) {
          console.warn('Token not found yet');
          return false;
        }
        const decodedToken = this.decodeToken(token);
        console.log('fetchCurrentUserId - Decoded:', decodedToken); // Debug log
        if (!decodedToken) {
          observer.error(new Error('Failed to decode token.'));
          return true;
        }
        const userId = decodedToken.userId || decodedToken.id || decodedToken.sub;
        if (!userId) {
          observer.error(new Error('User ID not found in token (tried userId, id, sub).'));
          return true;
        }
        const parsedUserId = parseInt(userId, 10);
        if (isNaN(parsedUserId)) {
          observer.error(new Error('Invalid user ID in token: ' + userId));
          return true;
        }
        this.currentUserIdSubject.next(parsedUserId);
        observer.next(parsedUserId);
        observer.complete();
        return true;
      };
  
      // Try immediately
      if (checkToken()) return;
  
      // Poll with a timeout
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds (increased from 3s for safety)
      const interval = setInterval(() => {
        attempts++;
        console.log('Polling attempt:', attempts, 'Token:', localStorage.getItem(tokenKey)); // Debug log
        if (checkToken() || attempts >= maxAttempts) {
          clearInterval(interval);
          if (attempts >= maxAttempts) {
            observer.error(new Error('Token not found after timeout. Please log in.'));
          }
        }
      }, 100);
  
      return () => clearInterval(interval); // Cleanup on unsubscribe
    });
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }
  getUserProjects(): Observable<Projet[]> {
    return this.currentUserId$.pipe(
      tap(userId => {
        if (!userId) throw new Error('User ID not set');
      }),
      switchMap(userId =>
        this.http.get<any[]>(`${this.apiUrl}/Getcardfounder/${userId}`, { headers: this.getHeaders() }).pipe(
          map(projectCards => projectCards.map(card => ({
            id: card[7], // id is 8th field (index 7)
            name: card[0],
            logoUrl: card[1],
            sector: card[2],
            location: card[3],
            creationDate: card[4],
            websiteUrl: card[5],
            globalScore: card[6],
            type: '',
            description: '',
            objectives: Objectives.COURT_TERME,
            status: Statut.EN_DEVELOPPEMENT,
            revenue: 0,
            numberOfEmployees: 0,
            nbFemaleEmployees: 0,
            lastUpdated: '',
            associatedSectors: '',
            technologiesUsed: '',
            fundingGoal: 0,
            lastEvaluationDate: '',
            produits: [],
            services: [],
            folders: [],
            phases: [],
            founder: null,
            entrepreneurs: [],
            coaches: [],
            investors: [],
            pendingCollaborator: null
          } as Projet))),
          catchError(this.handleError)
        )
      )
    );
  }

  createProjet(projet: Projet, logoFile: File | null): Observable<Projet> {
    const url = `${this.apiUrl}/AddProjet`;
    const formData = new FormData();
    const projetToSend = { ...projet, founder: undefined };
    formData.append('projet', JSON.stringify(projetToSend));
    if (logoFile) {
      formData.append('logourl', logoFile);
      console.log('FormData with file:', {
        projet: JSON.stringify(projetToSend),
        logourl: logoFile
      });
    } else {
      console.log('FormData without file:', {
        projet: JSON.stringify(projetToSend)
      });
    }
  
    return this.http.post<Projet>(url, formData, { headers: this.getHeaders(false) }).pipe(
      tap(response => console.log('Backend response:', response)),
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

  getPendingInvitations(): Observable<PendingInvitation[]> {
    const url = `${this.apiUrl}/pending-invitations`;
    return this.http.get<PendingInvitation[]>(url, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Pending invitations response:', response)),
      catchError(this.handleError)
    );
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
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
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
    return throwError(() => new Error(errorMessage)); // Line ~203
  }
}