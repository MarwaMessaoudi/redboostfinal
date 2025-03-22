import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reclamation } from '../../models/reclamation.model';
import { ReponseReclamation } from '../../models/reponse-reclamation.model';

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {
  private apiUrl = 'http://localhost:8085/api/reclamations';

  constructor(private http: HttpClient) {}

  private jsonHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  // 📌 Récupérer toutes les réclamations
  getAllReclamations(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.apiUrl}/getAllReclamations`, { headers: this.jsonHeaders });
  }
  
  

  // 📌 Récupérer une réclamation par ID
  getReclamationById(id: number): Observable<Reclamation> {
    return this.http.get<Reclamation>(`${this.apiUrl}/${id}`);
  }

  // 📌 Créer une nouvelle réclamation (avec fichier)
  createReclamation(formData: FormData): Observable<Reclamation> {
    return this.http.post<Reclamation>(this.apiUrl, formData);
  }

  // 📌 Créer une nouvelle réclamation (sans fichier, en JSON)
  createReclamationJson(reclamation: Reclamation): Observable<Reclamation> {
    return this.http.post<Reclamation>(this.apiUrl, reclamation, { headers: this.jsonHeaders });
  }

  // 📌 Mettre à jour une réclamation
  updateReclamation(id: number, reclamation: Partial<Reclamation>): Observable<Reclamation> {
    return this.http.put<Reclamation>(`${this.apiUrl}/${id}`, reclamation, { headers: this.jsonHeaders });
  }

  // 📌 Modifier le statut d'une réclamation
  updateReclamationStatus(id: number, statut: string): Observable<Reclamation> {
    return this.http.patch<Reclamation>(`${this.apiUrl}/${id}/status`, { statut }, { headers: this.jsonHeaders });
  }

  // 📌 Ajouter une réponse à une réclamation
  addReponseToReclamation(reclamationId: number, reponse: ReponseReclamation): Observable<ReponseReclamation> {
    return this.http.post<ReponseReclamation>(`${this.apiUrl}/${reclamationId}/reponses`, reponse, { headers: this.jsonHeaders });
  }

  // 📌 Supprimer une réclamation
  deleteReclamation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 📌 Récupérer les réclamations d'un utilisateur
  getReclamationsByUser(userId: number): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.apiUrl}/user/${userId}`);
  }

  // 📌 Messagerie liée aux réclamations
  getMessagesReclamation(reclamationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${reclamationId}/messages`);
  }

  envoyerMessage(message: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/messages`, message, { headers: this.jsonHeaders });
  }

  // NOUVELLE MÉTHODE : Récupérer les réclamations de l'utilisateur connecté
  getReclamationsUtilisateur(): Observable<string> {
    return this.http.get(`${this.apiUrl}/getAllReclamations`, { responseType: 'text' });
  }
  

}
