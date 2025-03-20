import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { StatutReclamation } from '../../models/statut-reclamation.model';

export interface ReponseReclamation {
  id: number;
  contenu: string;
  dateCreation: Date;
  sender: 'USER' | 'ADMIN';
  userId?: number;
  reclamation?: Reclamation;
  fichiers?: Fichier[];
}

export interface Message {
  id: number;
  contenu: string;
  date: Date;
  expediteur: 'utilisateur' | 'admin';
  fichiers?: any[];
}

export interface Fichier {
  id?: number;
  nom?: string;
  chemin?: string;
  url?: string;
}

export interface Reclamation {
  idReclamation: number;
  sujet: string;
  description: string;
  date: Date;
  statut: StatutReclamation;
  reponses?: ReponseReclamation[];
  fichiers?: Fichier[];
}

@Injectable({
  providedIn: 'root',
})
export class ReclamationService {
  private apiUrl = 'http://localhost:8085/api/reclamations';

  constructor(private http: HttpClient) {}

  // Get token from local storage
  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Add Authorization header to the request
  private getHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      console.warn('No access token found in localStorage!');
    }
    return headers;
  }

  getAllReclamations(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.apiUrl}`, {
      headers: this.getHeaders(),
    });
  }

  getReclamationsUtilisateur(): Observable<Reclamation[]> {
    return this.http
      .get<Reclamation[]>(`${this.apiUrl}`, { headers: this.getHeaders() })
      .pipe(
        catchError((error: any) => {
          console.error(
            'Erreur lors de la récupération des réclamations utilisateur :',
            error
          );
          return of([]); // Return an empty array in case of error
        })
      );
  }

  getReponses(idReclamation: number): Observable<ReponseReclamation[]> {
    return this.http.get<ReponseReclamation[]>(
      `${this.apiUrl}/${idReclamation}/responses`,
      { headers: this.getHeaders() }
    );
  }

  // Example of how your service methods might need to be adjusted
// Dans reclamation.service.ts, modifiez la méthode createReponse:
createReponse(
    idReclamation: number,
    contenu: string,
    isAdmin: boolean
  ): Observable<ReponseReclamation> {
    const url = isAdmin 
    ? `${this.apiUrl}/${idReclamation}/responses/admin` 
    : `${this.apiUrl}/${idReclamation}/responses/user`;
    const body = { contenu };
  
    console.log('URL de la requête:', url);
    console.log('Corps de la requête:', body);
    console.log('Headers:', this.getHeaders().keys());
    
    return this.http
      .post<ReponseReclamation>(url, body, {
        headers: this.getHeaders().set('Content-Type', 'application/json')
      })
      .pipe(
        tap(response => console.log('Réponse du serveur:', response)),
        catchError(error => {
          console.error('Erreur complète:', error);
          return this.handleError(error);
        })
      );
  }

  updateReclamationStatut(
    idReclamation: number,
    statut: StatutReclamation
  ): Observable<any> {
    const url = `${this.apiUrl}/${idReclamation}/statut`;

    return this.http.patch<any>(url, { statut }, { headers: this.getHeaders() })
      .pipe(
        tap((updatedReclamation: any) =>
          console.log(`Réclamation ${idReclamation} statut mis à jour.`)
        ),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
      if (error.error) {
        console.error('Corps de la réponse d\'erreur:', error.error);
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}