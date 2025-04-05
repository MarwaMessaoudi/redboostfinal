// src/app/services/produit.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Produit } from '../../../models/Produit'; 

@Injectable({
  providedIn: 'root',
})
export class ProduitService {
  private apiUrl = 'http://localhost:8085/api/produits';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    const token = localStorage.getItem('token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  createProduit(projetId: number, produit: Produit): Observable<Produit> {
    const url = `${this.apiUrl}/AddProduit/${projetId}`;
    return this.http.post<Produit>(url, produit, { headers: this.getHeaders() }).pipe(
      tap(() => console.log(`Created produit for projetId=${projetId}`)),
      catchError(this.handleError)
    );
  }

  getAllProduits(): Observable<Produit[]> {
    const url = `${this.apiUrl}/GetAllprod`;
    return this.http.get<Produit[]>(url, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getProduitById(id: number): Observable<Produit> {
    const url = `${this.apiUrl}/GetProduitById/${id}`;
    return this.http.get<Produit>(url, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateProduit(id: number, produit: Produit): Observable<Produit> {
    const url = `${this.apiUrl}/UpdateProd/${id}`;
    return this.http.put<Produit>(url, produit, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteProduit(id: number): Observable<void> {
    const url = `${this.apiUrl}/DeleteProd/${id}`;
    return this.http.delete<void>(url, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred. Please try again later.';
    if (error.status === 401) errorMessage = 'Session expired. Please log in again.';
    else if (error.status === 400) errorMessage = error.error?.message || 'Invalid request.';
    else if (error.status === 403) errorMessage = 'Access denied.';
    else if (error.status === 404) errorMessage = 'Produit not found.';
    else if (error.status === 500) errorMessage = 'Internal server error.';
    return throwError(() => new Error(errorMessage));
  }
}