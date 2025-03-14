import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
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
    providedIn: 'root'
})
export class ReclamationService {
   private apiUrl = 'http://localhost:8085/api/reclamations';

    constructor(private http: HttpClient) { }

    // Get token from local storage
    private getAccessToken(): string | null {
        return localStorage.getItem('authToken');
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
        return this.http.get<Reclamation[]>(`${this.apiUrl}`, { headers: this.getHeaders() });
    }

    getReclamationsUtilisateur(): Observable<Reclamation[]> {
        return this.http.get<Reclamation[]>(`${this.apiUrl}`, { headers: this.getHeaders() })
            .pipe(
                catchError(this.handleError<Reclamation[]>('getReclamationsUtilisateur', []))
            );
    }

    getReponses(idReclamation: number): Observable<ReponseReclamation[]> {
        return this.http.get<ReponseReclamation[]>(`${this.apiUrl}/${idReclamation}/reponses`, { headers: this.getHeaders() });
    }

    createReponse(idReclamation: number, contenu: string, isAdmin: boolean): Observable<ReponseReclamation> {
        const reponse = { contenu: contenu };
        let url: string;

        if (isAdmin) {
            const adminId = 1;
            url = `${this.apiUrl}/${idReclamation}/reponses/admin/${adminId}`;
        } else {
            const userId = 1;
            url = `${this.apiUrl}/${idReclamation}/reponses/user/${userId}`;
        }

        return this.http.post<ReponseReclamation>(url, reponse, { headers: this.getHeaders() });
    }

    updateReclamationStatut(idReclamation: number, statut: StatutReclamation): Observable<any> {
        const url = `${this.apiUrl}/${idReclamation}/statut`;

        return this.http.patch<any>(url, { statut }, { headers: this.getHeaders() })
            .pipe(
                tap((updatedReclamation: any) => console.log(`Réclamation ${idReclamation} statut mis à jour.`)),
                catchError(this.handleError<any>('updateReclamationStatut'))
            );
    }
    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.error(`${operation} a échoué:`, error);
            console.error("Error Status:", error.status);
            console.error("Error Body:", error.error);
            console.error("Full Error Object:", error);
            return throwError(() => error);
        };
    }
}