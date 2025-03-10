import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReclamationService } from '../layout/service/reclamation.service';

@Component({
  selector: 'app-gestion-reclamation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [DatePipe, ReclamationService],
  templateUrl: './gestion-reclamation.component.html',
  styleUrls: ['./gestion-reclamation.component.scss']
})
export class GestionReclamationComponent implements OnInit {
  reclamationForm: FormGroup;
  selectedFiles: File[] = [];
  fileError: string | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isSubmitting = false;

  idUtilisateur = 1;

  constructor(
    private fb: FormBuilder,
    private reclamationService: ReclamationService,
    private datePipe: DatePipe
  ) {
    this.reclamationForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      date: [{ value: this.formatDate(new Date()), disabled: true }],
      categorie: ['', Validators.required],
      sujet: ['', Validators.required],
      description: ['', Validators.required],
      fichierReclamation: [null]
    });
  }

  ngOnInit(): void {

  }

  get f() {
    return this.reclamationForm.controls;
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-ddTHH:mm:ss.SSSZ') || new Date().toISOString();
  }

  onFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFiles = [];
    this.fileError = null;

    if (input.files && input.files.length) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 5 * 1024 * 1024;

        if (allowedTypes.includes(file.type)) {
          if (file.size <= maxSize) {
            this.selectedFiles.push(file);
          } else {
            this.fileError = 'Un ou plusieurs fichiers sont trop volumineux (max 5 MB)';
            this.selectedFiles = [];
            break;
          }
        } else {
          this.fileError = 'Format de fichier non supporté. Veuillez sélectionner un PDF, JPG ou PNG';
          this.selectedFiles = [];
          break;
        }
      }
    }
  }

  onSubmit(): void {
    if (this.reclamationForm.invalid) {
      return;
    }

    const formData = new FormData();
    const reclamationData = {
      idUtilisateur: this.idUtilisateur,
      nom: this.reclamationForm.get('nom')?.value,
      email: this.reclamationForm.get('email')?.value,
      sujet: this.reclamationForm.get('sujet')?.value,
      date: new Date().toISOString(),
      statut: 'EN_ATTENTE',
      description: this.reclamationForm.get('description')?.value,
      categorie: this.reclamationForm.get('categorie')?.value
    };

    formData.append('reclamation', new Blob([JSON.stringify(reclamationData)], { type: 'application/json' }));

    for (let i = 0; i < this.selectedFiles.length; i++) {
      formData.append('files', this.selectedFiles[i], this.selectedFiles[i].name);
    }

    this.isSubmitting = true;
    this.reclamationService.createReclamation(formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Votre réclamation a été soumise avec succès!';
        this.resetForm();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'Une erreur est survenue lors de la soumission de votre réclamation. Veuillez réessayer.';
        console.error('Erreur lors de la création de la réclamation:', error);
      }
    });
  }

  resetForm(): void {
    this.reclamationForm.reset();
    this.reclamationForm.patchValue({
      date: this.formatDate(new Date())
    });
    this.selectedFiles = [];
    this.fileError = null;
  }
}