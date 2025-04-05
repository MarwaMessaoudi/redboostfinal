import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ProjetService } from '../../service/projet-service.service';
import { Objectives, Projet, Statut } from '../../../models/Projet'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-projet',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    RippleModule,
  ],
  templateUrl: './addprojet.component.html',
  styleUrls: ['./addprojet.component.scss'],
})
export class AddProjetComponent implements OnInit {
  stepForm!: FormGroup;
  step: number = 1;
  isSaving: boolean = false;
  updateMessage: string = '';
  logoFile: File | null = null;
  objectives = Object.values(Objectives);
  statuses = Object.values(Statut);

  constructor(
    private fb: FormBuilder,
    private projetService: ProjetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkAuthentication();
  }

  initializeForm(): void {
    this.stepForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      sector: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required],
      objectives: [Objectives.COURT_TERME, Validators.required],
      status: [Statut.EN_DEVELOPPEMENT, Validators.required],
      creationDate: [
        new Date().toISOString().split('T')[0],
        Validators.required,
      ],
      location: ['', Validators.required],
      revenue: [0, [Validators.min(0)]],
      fundingGoal: [0, [Validators.min(0)]],
      numberOfEmployees: [0, [Validators.min(0)]],
      nbFemaleEmployees: [0, [Validators.min(0)]],
      globalScore: [0, [Validators.min(0), Validators.max(100)]],
      websiteUrl: ['', [Validators.pattern('https?://.+')]],
      associatedSectors: [''],
      technologiesUsed: [''],
      lastEvaluationDate: [''],
    });
  }

  checkAuthentication(): void {
    // Use getUserProjects instead of getAllProjets to check auth
    this.projetService.getUserProjects().subscribe({
      next: () => {
        console.log('User is authenticated');
      },
      error: (error) => {
        if (error.status === 401) {
          console.warn('User not authenticated, redirecting to login');
          this.router.navigate(['/login']);
        }
      },
    });
  }

  isStepValid(): boolean {
    if (this.step === 1) {
      return (
        this.stepForm.controls['name'].valid &&
        this.stepForm.controls['sector'].valid &&
        this.stepForm.controls['type'].valid &&
        this.stepForm.controls['description'].valid
      );
    } else if (this.step === 2) {
      return (
        this.stepForm.controls['objectives'].valid &&
        this.stepForm.controls['status'].valid &&
        this.stepForm.controls['creationDate'].valid &&
        this.stepForm.controls['location'].valid
      );
    } else if (this.step === 3 || this.step === 4) {
      return true; // Optional fields
    }
    return false;
  }

  goToNextStep(): void {
    if (this.isStepValid()) {
      this.step++;
      this.updateMessage = '';
    } else {
      this.updateMessage = 'Veuillez remplir tous les champs requis de cette étape.';
      setTimeout(() => (this.updateMessage = ''), 3000);
    }
  }

  goToPreviousStep(): void {
    if (this.step > 1) {
      this.step--;
      this.updateMessage = '';
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.logoFile = input.files[0];
      console.log('File selected:', this.logoFile); // Log the entire File object
    } else {
      console.warn('No file selected');
      this.logoFile = null;
    }
  }

  onSubmit(): void {
    if (this.stepForm.valid) {
      this.isSaving = true;
      this.updateMessage = '';

      const projet = new Projet(
        this.stepForm.value.name,
        this.stepForm.value.sector,
        this.stepForm.value.type,
        this.stepForm.value.creationDate,
        this.stepForm.value.description,
        this.stepForm.value.objectives,
        this.stepForm.value.status,
        this.stepForm.value.globalScore,
        this.stepForm.value.location,
        '', // logoUrl will be set by the backend
        this.stepForm.value.websiteUrl,
        this.stepForm.value.revenue,
        this.stepForm.value.numberOfEmployees,
        this.stepForm.value.nbFemaleEmployees,
        '', // lastUpdated will be set by the backend
        this.stepForm.value.associatedSectors,
        this.stepForm.value.technologiesUsed,
        this.stepForm.value.fundingGoal,
        this.stepForm.value.lastEvaluationDate
      );

      this.projetService.createProjet(projet, this.logoFile).subscribe({
        next: (response) => {
          console.log('Projet créé:', response);
          this.isSaving = false;
          Swal.fire({
            icon: 'success',
            title: 'Succès!',
            text: 'Projet créé avec succès!',
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            this.updateMessage = '';
            this.router.navigate(['/GetProjet']); // Consistent route
          });
        },
        error: (error) => {
          console.error('Erreur lors de la création du projet:', error);
          this.isSaving = false;
          let errorMessage = 'Erreur inconnue. Consultez les logs du serveur.';
          if (error.status === 400 && error.error?.includes('A project with the name')) {
            errorMessage = 'Un projet avec ce nom existe déjà.';
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.statusText) {
            errorMessage = error.statusText;
          } else if (error.status === 401) {
            errorMessage = 'Non autorisé. Veuillez vous connecter.';
            this.router.navigate(['/login']);
          }
          Swal.fire({
            icon: 'error',
            title: 'Erreur!',
            text: `Erreur: ${errorMessage}`,
            timer: 3000,
            showConfirmButton: false,
          });
        },
      });
    } else {
      this.updateMessage = 'Veuillez remplir tous les champs requis.';
      setTimeout(() => (this.updateMessage = ''), 3000);
    }
  }

  cancel(): void {
    this.router.navigate(['/GetProjet']); // Corrected route to match navigation
  }
}