import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MessagesModule } from 'primeng/messages';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProjetService } from '../projet-service.service';
import { Objectives, Projet, Statut } from '../../../models/Projet';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface ProductService {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-details-projet',
  standalone: true,
  templateUrl: './details-projet.component.html',
  styleUrls: ['./details-projet.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    MessagesModule,
    ProgressSpinnerModule,
  ],
})
export class DetailsProjetComponent implements OnInit {
  projet: Projet | null = null;
  isEditing: boolean = false;
  isSaving: boolean = false;
  updateMessage: string = '';
  logoFile: File | null = null;
  objectives = Object.values(Objectives);
  statuses = Object.values(Statut);
  hoveredItem: number | null = null;
  hoveredFeature: number | null = null;

  productServices: ProductService[] = [
    {
      id: 1,
      title: "Products",
      description: "Explore our curated marketplace of innovative products.",
      icon: "shopping_cart",
      color: "#245C67"
    },
    {
      id: 2,
      title: "Services",
      description: "Find expert services tailored to your needs.",
      icon: "build",
      color: "#DB1E37"
    }
  ];

  constructor(
    private projetService: ProjetService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      if (!isNaN(id)) {
        this.loadProject(id);
      } else {
        console.warn('Invalid project ID provided in URL:', idParam);
        this.router.navigate(['/affiche-projet']);
      }
    } else {
      console.warn('No project ID provided in URL');
      this.router.navigate(['/affiche-projet']);
    }
  }

  loadProject(id: number): void {
    this.projetService.getProjetById(id).subscribe({
      next: (data) => {
        if (data) {
          this.projet = data;
          console.log('Project loaded:', data);
        } else {
          console.warn('No project data received for ID:', id);
          this.router.navigate(['/affiche-projet']);
        }
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.updateMessage = 'Erreur lors du chargement du projet.';
        this.router.navigate(['/affiche-projet']);
      },
    });
  }

  sanitizedImageUrl(url: string | undefined): SafeUrl {
    if (!url || url === 'null' || url === 'ROLE_USER') {
      return this.sanitizer.bypassSecurityTrustUrl('/assets/default-logo.png');
    }
    const baseUrl = 'http://localhost:8085';
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    return this.sanitizer.bypassSecurityTrustUrl(fullUrl);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/default-logo.png';
    img.onerror = null;
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.updateMessage = '';
    this.logoFile = null;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.logoFile = input.files[0];
      console.log('Selected file:', this.logoFile.name);
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.updateMessage = '';
    this.logoFile = null;
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      this.loadProject(id);
    }
  }

  saveChanges(): void {
    if (this.projet && this.projet.id) {
      this.isSaving = true;
      this.updateMessage = '';

      const updatedProjet = new Projet(
        this.projet.name,
        this.projet.sector,
        this.projet.type,
        this.projet.creationDate,
        this.projet.description,
        this.projet.objectives,
        this.projet.status,
        this.projet.globalScore,
        this.projet.location,
        this.projet.logoUrl,
        this.projet.websiteUrl,
        this.projet.revenue,
        this.projet.numberOfEmployees,
        this.projet.nbFemaleEmployees,
        this.projet.lastUpdated,
        this.projet.associatedSectors,
        this.projet.technologiesUsed,
        this.projet.fundingGoal,
        this.projet.lastEvaluationDate
      );

      this.projetService.updateProjet(this.projet.id, updatedProjet, this.logoFile).subscribe({
        next: (response) => {
          this.isSaving = false;
          this.isEditing = false;
          this.logoFile = null;
          this.projet = response;
          this.updateMessage = 'Projet mis à jour avec succès!';
          console.log('Project updated:', response);
          setTimeout(() => (this.updateMessage = ''), 3000);
        },
        error: (error) => {
          console.error('Error updating project:', error);
          this.isSaving = false;
          this.updateMessage = 'Erreur lors de la mise à jour du projet.';
          if (error.status === 400 && error.error?.message) {
            this.updateMessage = error.error.message;
          }
        },
      });
    }
  }
}