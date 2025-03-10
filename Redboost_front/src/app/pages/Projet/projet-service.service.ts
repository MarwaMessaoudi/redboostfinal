// projet-service.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Projet } from '../../models/Projet';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {
  private apiUrl = 'http://localhost:8085/api/projets';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders();
  }

  createProjet(formData: FormData): Observable<Projet> {
    const url = `${this.apiUrl}/AddProjet`;
    return this.http.post<Projet>(url, formData, { headers: this.getHeaders() });
  }

  getAllProjets(): Observable<Projet[]> {
    const url = `${this.apiUrl}/GetAll`;
    return this.http.get<Projet[]>(url, { headers: this.getHeaders() });
  }

  getProjetById(id: number): Observable<Projet> {
    const url = `${this.apiUrl}/GetProjet/${id}`;
    return this.http.get<Projet>(url, { headers: this.getHeaders() });
  }

  updateProjet(id: number, formData: FormData): Observable<Projet> {
    const url = `${this.apiUrl}/UpdateProjet/${id}`;
    return this.http.put<Projet>(url, formData, { headers: this.getHeaders() });
  }

  deleteProjet(id: number): Observable<void> {
    const url = `${this.apiUrl}/DeleteProjet/${id}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() });
  }

  getProjetCardByFounderId(founderId: string): Observable<any> {
    const url = `${this.apiUrl}/Getcardfounder/${founderId}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }
}