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
    newProduit: Produit = this.resetProduit();
    editingProduit: Produit | null = null;
    projetId: number = 0;
    errorMessage: string = '';
    successMessage: string = '';
    showAddModal: boolean = false;
    selectedFile: File | null = null;
    isLoading: boolean = false;

    constructor(private produitService: ProduitService) {}

    ngOnInit(): void {
        this.loadProduits();
    }

    loadProduits(): void {
        this.isLoading = true;
        this.produitService.getAllProduits().subscribe({
            next: (produits) => {
                this.produits = produits.map(p => ({
                    ...p,
                    isFavorite: p.isFavorite ?? false
                }));
                this.isLoading = false;
            },
            error: (err) => {
                this.handleError('Failed to load products', err);
                this.isLoading = false;
            }
        });
    }

    openAddModal(): void {
        this.showAddModal = true;
        this.newProduit = this.resetProduit();
        this.clearMessages();
    }

    closeAddModal(): void {
        this.showAddModal = false;
        this.clearForm();
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files?.length) {
            const file = input.files[0];
            if (file.type.startsWith('image/')) {
                this.selectedFile = file;
            } else {
                this.errorMessage = 'Please select a valid image file';
                this.selectedFile = null;
            }
        }
    }

    createProduit(): void {
        if (!this.isValidProduit(this.newProduit) || this.projetId <= 0) {
            this.errorMessage = 'Please fill all required fields correctly';
            return;
        }

        this.isLoading = true;
        const formData = this.prepareFormData(this.newProduit);
        this.produitService.createProduit(this.projetId, formData).subscribe({
            next: (produit) => {
                this.produits.push({ ...produit, isFavorite: false });
                this.successMessage = 'Product added successfully';
                this.isLoading = false;
                this.closeAddModal();
            },
            error: (err) => this.handleError('Failed to add product', err)
        });
    }

    editProduit(produit: Produit): void {
        this.editingProduit = { ...produit };
        this.clearMessages();
    }

    updateProduit(): void {
        if (!this.editingProduit || !this.isValidProduit(this.editingProduit)) {
            this.errorMessage = 'Please fill all required fields correctly';
            return;
        }

        this.isLoading = true;
        const formData = this.prepareFormData(this.editingProduit);
        this.produitService.updateProduit(this.editingProduit.id!, formData).subscribe({
            next: (updatedProduit) => {
                const index = this.produits.findIndex(p => p.id === updatedProduit.id);
                if (index !== -1) {
                    this.produits[index] = { ...updatedProduit, isFavorite: this.produits[index].isFavorite };
                }
                this.successMessage = 'Product updated successfully';
                this.isLoading = false;
                this.editingProduit = null;
            },
            error: (err) => this.handleError('Failed to update product', err)
        });
    }

    deleteProduit(id: number): void {
        if (!confirm('Are you sure you want to delete this product?')) return;

        this.isLoading = true;
        this.produitService.deleteProduit(id).subscribe({
            next: () => {
                this.produits = this.produits.filter(p => p.id !== id);
                this.successMessage = 'Product deleted successfully';
                this.isLoading = false;
            },
            error: (err) => this.handleError('Failed to delete product', err)
        });
    }

    toggleFavorite(produit: Produit): void {
        produit.isFavorite = !produit.isFavorite;
    }

    private isValidProduit(produit: Produit): boolean {
        return !!produit.name && 
               produit.price > 0 && 
               produit.stock >= 0 && 
               produit.poids > 0 && 
               !!produit.categorie;
    }

    private prepareFormData(produit: Produit): FormData {
        const formData = new FormData();
        formData.append('produit', new Blob([JSON.stringify(produit)], { type: 'application/json' }));
        if (this.selectedFile) {
            formData.append('image', this.selectedFile);
        }
        return formData;
    }

    private handleError(message: string, err: any): void {
        this.errorMessage = `${message}: ${err.message || 'Unknown error'}`;
        this.successMessage = '';
        this.isLoading = false;
    }

    private clearMessages(): void {
        this.errorMessage = '';
        this.successMessage = '';
    }

    private clearForm(): void {
        this.newProduit = this.resetProduit();
        this.projetId = 0;
        this.selectedFile = null;
        this.clearMessages();
    }

    private resetProduit(): Produit {
        return new Produit('', 0, 0, 0, 0, '', '');
    }
}