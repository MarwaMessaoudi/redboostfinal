// src/app/show-produits/show-produits.component.ts (unchanged)

import { Component, OnInit } from '@angular/core';
import { ProduitService } from '../produit.service'; 
import { Produit } from '../../../../models/Produit'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-show-produits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './show-produits.component.html',
  styleUrls: ['./show-produits.component.scss']
})
export class ShowProduitsComponent implements OnInit {
  produits: Produit[] = [];
  newProduit: Produit = new Produit('', 0, 0, 0, 0, '', '');
  projetId: number = 0;
  errorMessage: string = '';
  editingProduit: Produit | null = null;
  showAddModal: boolean = false;

  constructor(private produitService: ProduitService) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.produitService.getAllProduits().subscribe({
      next: (produits) => this.produits = produits.map(p => new Produit(
        p.name, p.price, p.stock, p.ventes, p.poids, p.categorie, p.dateExpiration || '',
        p.description, p.image, p.id
      )),
      error: (err) => this.errorMessage = err.message
    });
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  createProduit(): void {
    if (this.projetId <= 0) {
      this.errorMessage = 'Please enter a valid Projet ID.';
      return;
    }
    this.produitService.createProduit(this.projetId, this.newProduit).subscribe({
      next: (produit) => {
        this.produits.push(new Produit(
          produit.name, produit.price, produit.stock, produit.ventes, produit.poids, produit.categorie,
          produit.dateExpiration || '', produit.description, produit.image, produit.id
        ));
        this.closeAddModal();
      },
      error: (err) => this.errorMessage = err.message
    });
  }

  editProduit(produit: Produit): void {
    this.editingProduit = new Produit(
      produit.name, produit.price, produit.stock, produit.ventes, produit.poids, produit.categorie,
      produit.dateExpiration || '', produit.description, produit.image, produit.id
    );
  }

  updateProduit(): void {
    if (this.editingProduit && this.editingProduit.id) {
      this.produitService.updateProduit(this.editingProduit.id, this.editingProduit).subscribe({
        next: (updatedProduit) => {
          const index = this.produits.findIndex(p => p.id === updatedProduit.id);
          if (index !== -1) {
            this.produits[index] = new Produit(
              updatedProduit.name, updatedProduit.price, updatedProduit.stock, updatedProduit.ventes,
              updatedProduit.poids, updatedProduit.categorie, updatedProduit.dateExpiration || '',
              updatedProduit.description, updatedProduit.image, updatedProduit.id
            );
          }
          this.editingProduit = null;
        },
        error: (err) => this.errorMessage = err.message
      });
    }
  }

  deleteProduit(id: number): void {
    if (confirm('Are you sure you want to delete this produit?')) {
      this.produitService.deleteProduit(id).subscribe({
        next: () => this.produits = this.produits.filter(p => p.id !== id),
        error: (err) => this.errorMessage = err.message
      });
    }
  }

  resetForm(): void {
    this.newProduit = new Produit('', 0, 0, 0, 0, '', '');
    this.projetId = 0;
    this.errorMessage = '';
  }
}