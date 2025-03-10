// reclamation.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StatutReclamation } from '../../models/statut-reclamation.model';
import { tap } from 'rxjs/operators';


export interface ReponseReclamation {  // Définir l'interface pour ReponseReclamation
  id: number;
  contenu: string;
  dateCreation: Date;
  sender: 'USER' | 'ADMIN';
  userId?: number;  // L'ID de l'utilisateur ou de l'admin qui a posté le message (optionnel)
  reclamation?: Reclamation;
  fichiers?: Fichier[];
}


export interface Message {  // Keeping this for potential file uploads
  id: number;
  contenu: string;
  date: Date;
  expediteur: 'utilisateur' | 'admin';  // Deprecated
  fichiers?: any[];
}
export interface Fichier {
  id?: number;
  nom?: string;
  chemin?: string;
  url?: string;
  // Add other properties as needed
}
export interface Reclamation {
  idReclamation: number;
  sujet: string;
  description: string;
  date: Date;
  statut: StatutReclamation;
  reponses?: ReponseReclamation[];
  fichiers?: Fichier[];  // Use ReponseReclamation
}

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {
  private apiUrl = 'http://localhost:8085/api/reclamations';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }
  

  getAllReclamations(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.apiUrl}/getAllReclamations`, { headers: this.getHeaders() });
  }

  getReclamationsUtilisateur(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.apiUrl}/getAllReclamations`, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError<Reclamation[]>('getReclamationsUtilisateur', []))
      );
  }

  getReponses(idReclamation: number): Observable<ReponseReclamation[]> {
    return this.http.get<ReponseReclamation[]>(`${this.apiUrl}/${idReclamation}/reponses`);
  }
  
  // Nouvelle méthode pour créer une réponse (admin ou utilisateur)
  createReponse(idReclamation: number, contenu: string, isAdmin: boolean): Observable<ReponseReclamation> {
    const reponse = { contenu: contenu };
    const adminId = 1; //TODO A remplacer avec l'ID de l'admin loggé

    if (isAdmin) {
        return this.http.post<ReponseReclamation>(`${this.apiUrl}/${idReclamation}/reponses/admin/${adminId}`, reponse);
    } else {
        const userId = 1; //TODO A remplacer avec l'ID de l'utilisateur loggé
        return this.http.post<ReponseReclamation>(`${this.apiUrl}/${idReclamation}/reponses/user/${userId}`, reponse);
    }
  }


  updateReclamationStatut(idReclamation: number, statut: StatutReclamation): Observable<Reclamation> {
    const url = `${this.apiUrl}/${idReclamation}/statut`;  // URL corrigée (pas de /reponses)
    const body = { statut: statut };
    return this.http.put<Reclamation>(url, body, { headers: this.getHeaders() }) // Typer la réponse
      .pipe(
        tap((updatedReclamation: Reclamation) => console.log(`Réclamation ${idReclamation} statut mis à jour.`)),
        catchError(this.handleError<Reclamation>('updateReclamationStatut')) // Gestion des erreurs
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} a échoué:`, error);
      return new Observable<T>(subscriber => subscriber.next(result as T));
    };
  }
}