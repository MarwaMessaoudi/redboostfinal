import { Component, OnInit, AfterViewInit, SecurityContext } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { ProjetService } from '../projet-service.service';
import { Projet } from '../../../models/Projet';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-details-projet',
  standalone: true,
  templateUrl: './details-projet.component.html',
  styleUrls: ['./details-projet.component.scss'],
  imports: [CommonModule, RouterModule, FormsModule]
})
export class DetailsProjetComponent implements OnInit, AfterViewInit {
  projet: Projet | null = null;
  isEditing: boolean = false;
  isSaving: boolean = false;
  updateMessage: string = '';
  logoFile: File | null = null;
  cachedLogoUrl: string | null = null; // Cache the logo URL

  constructor(
    private projetService: ProjetService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projetService.getProjetById(Number(id)).subscribe({
        next: (data) => {
          this.projet = data;
          this.checkLogoUrl(); // Check logo URL on init
        },
        error: (error) => {
          console.error('Erreur lors du chargement du projet:', error);
          this.projet = null;
        }
      });
    } else {
      console.warn('Aucun ID de projet fourni dans l\'URL');
    }
  }

  ngAfterViewInit(): void {
    // Ensure logo URL is checked after view initialization
    this.checkLogoUrl();
  }

  // Get the logo URL
  getLogoUrl(): string {
    if (!this.cachedLogoUrl) {
      this.checkLogoUrl();
    }
    console.log('Returning cached logo URL:', this.cachedLogoUrl || '/assets/default-logo.png');
    return this.cachedLogoUrl || '/assets/default-logo.png';
  }

  // Check and cache the logo URL (run once)
  private checkLogoUrl(): void {
    if (this.cachedLogoUrl) return; // Prevent re-checking
    if (this.projet?.logoUrl && this.projet.logoUrl !== 'null' && this.projet.logoUrl !== 'ROLE_USER') {
      const baseUrl = 'http://localhost:8085';
      const fullUrl = this.projet.logoUrl.startsWith('http') ? this.projet.logoUrl : `${baseUrl}${this.projet.logoUrl}`;
      console.log('Checking image URL:', fullUrl);
      const img = new Image();
      img.src = fullUrl;
      img.onload = () => {
        console.log('Image loaded successfully:', fullUrl);
        this.cachedLogoUrl = this.sanitizer.sanitize(SecurityContext.URL, fullUrl) || fullUrl;
      };
      img.onerror = () => {
        console.error('Image failed to load:', fullUrl);
        this.cachedLogoUrl = '/assets/default-logo.png'; // Ensure fallback exists
      };
    } else {
      console.log('Invalid or null logoUrl, falling back:', this.projet?.logoUrl);
      this.cachedLogoUrl = '/assets/default-logo.png';
    }
  }

  toggleEdit() {
    console.log('Toggle Edit clicked, isEditing:', !this.isEditing);
    this.isEditing = !this.isEditing;
    this.updateMessage = '';
    this.logoFile = null;
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.logoFile = input.files[0];
    }
  }

  cancelEdit() {
    console.log('Cancel Edit clicked');
    this.isEditing = false;
    this.updateMessage = '';
    this.logoFile = null;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.projetService.getProjetById(id).subscribe({
      next: (data) => {
        this.projet = data;
        this.checkLogoUrl(); // Recache logo URL on reload
      },
      error: (error) => {
        console.error('Erreur lors du rechargement:', error);
      }
    });
  }

  saveChanges() {
    console.log('Save Changes clicked');
    if (this.projet) {
      this.isSaving = true;
      this.updateMessage = '';
      const id = Number(this.route.snapshot.paramMap.get('id'));
      const formData = new FormData();
      formData.append('projet', new Blob([JSON.stringify(this.projet)], { type: 'application/json' }));
      if (this.logoFile) {
        formData.append('logourl', this.logoFile);
      }
      this.projetService.updateProjet(id, formData).subscribe({
        next: (response) => {
          this.isSaving = false;
          this.isEditing = false;
          this.logoFile = null;
          this.updateMessage = 'Projet mis à jour avec succès!';
          this.checkLogoUrl(); // Recache logo URL after save
          setTimeout(() => this.updateMessage = '', 3000);
        },
        error: (error) => {
          this.isSaving = false;
          this.updateMessage = 'Erreur lors de la mise à jour. Vérifiez les logs serveur.';
          console.error('Erreur lors de la mise à jour:', error);
        }
      });
    }
  }
}