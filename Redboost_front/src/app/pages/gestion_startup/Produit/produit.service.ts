import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produit } from '../../../models/Produit';

@Injectable({
    providedIn: 'root'
})
export class ProduitService {
    private apiUrl = 'http://localhost:8085/api/produits';

    constructor(private http: HttpClient) {}

    createProduit(projetId: number, formData: FormData): Observable<Produit> {
        return this.http.post<Produit>(`${this.apiUrl}/AddProduit/${projetId}`, formData);
    }

    getAllProduits(): Observable<Produit[]> {
        return this.http.get<Produit[]>(`${this.apiUrl}/GetAllprod`);
    }

    getProduitById(id: number): Observable<Produit> {
        return this.http.get<Produit>(`${this.apiUrl}/GetProduitById/${id}`);
    }

    updateProduit(id: number, formData: FormData): Observable<Produit> {
        return this.http.put<Produit>(`${this.apiUrl}/UpdateProd/${id}`, formData);
    }

    deleteProduit(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/DeleteProd/${id}`);
    }
}