import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ProjetService } from '../projet-service.service';
import { Projet } from '../../../models/Projet';
import Swal from 'sweetalert2'; // Import SweetAlert2

@Component({
  selector: 'app-add-projet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonModule, RippleModule],
  templateUrl: './addprojet.component.html',
  styleUrls: ['./addprojet.component.scss']
})
export class AddProjetComponent implements OnInit {
  projet: Projet = new Projet(
    '', '', '', '', '', '', '', 0, '', '', '', '', 0, 0, 0, '', '', '', 0, ''
  );

  stepForm!: FormGroup;
  step: number = 1;
  isSaving: boolean = false;
  updateMessage: string = '';

  logoFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private projetService: ProjetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.stepForm = this.fb.group({
      name: ['', Validators.required],
      sector: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required],
      objectives: ['', Validators.required],
      status: ['', Validators.required],
      creationDate: ['', Validators.required],
      location: ['', Validators.required],
      logoUrl: [''], // Not directly used, managed via file
      revenue: [0],
      fundingGoal: [0],
      numberOfEmployees: [0],
      nbFemaleEmployees: [0],
      globalScore: [0],
      websiteUrl: [''],
      foundersIds: [''],
      associatedSectors: [''],
      technologiesUsed: [''],
      lastEvaluationDate: ['']
    });
  }

  isStepValid(): boolean {
    if (this.step === 1) {
      return this.stepForm.controls['name'].valid &&
             this.stepForm.controls['sector'].valid &&
             this.stepForm.controls['type'].valid &&
             this.stepForm.controls['description'].valid;
    } else if (this.step === 2) {
      return this.stepForm.controls['objectives'].valid &&
             this.stepForm.controls['status'].valid &&
             this.stepForm.controls['creationDate'].valid &&
             this.stepForm.controls['location'].valid;
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
      this.updateMessage = 'Please fill all required fields in this step.';
      setTimeout(() => this.updateMessage = '', 3000);
    }
  }

  goToPreviousStep(): void {
    if (this.step > 1) {
      this.step--;
      this.updateMessage = '';
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.logoFile = input.files[0];
      console.log('Selected file:', this.logoFile.name);
    }
  }

  onSubmit(): void {
    if (this.stepForm.valid) {
      this.isSaving = true;
      this.updateMessage = '';

      // Map all form values to projet object
      this.projet.name = this.stepForm.value.name;
      this.projet.sector = this.stepForm.value.sector;
      this.projet.type = this.stepForm.value.type;
      this.projet.description = this.stepForm.value.description;
      this.projet.objectives = this.stepForm.value.objectives;
      this.projet.status = this.stepForm.value.status;
      this.projet.creationDate = this.stepForm.value.creationDate;
      this.projet.location = this.stepForm.value.location;
      this.projet.revenue = this.stepForm.value.revenue || 0;
      this.projet.fundingGoal = this.stepForm.value.fundingGoal || 0;
      this.projet.numberOfEmployees = this.stepForm.value.numberOfEmployees || 0;
      this.projet.nbFemaleEmployees = this.stepForm.value.nbFemaleEmployees || 0;
      this.projet.globalScore = this.stepForm.value.globalScore || 0;
      this.projet.websiteUrl = this.stepForm.value.websiteUrl || '';
      this.projet.foundersIds = this.stepForm.value.foundersIds || '';
      this.projet.associatedSectors = this.stepForm.value.associatedSectors || '';
      this.projet.technologiesUsed = this.stepForm.value.technologiesUsed || '';
      this.projet.lastEvaluationDate = this.stepForm.value.lastEvaluationDate || '';

      const formData = new FormData();
      formData.append('projet', new Blob([JSON.stringify(this.projet)], { type: 'application/json' }));
      if (this.logoFile) {
        formData.append('logourl', this.logoFile);
        console.log('File added to FormData:', this.logoFile.name);
      } else {
        console.log('No file selected');
      }

      this.projetService.createProjet(formData).subscribe({
        next: (response) => {
          console.log('Projet created:', response);
          this.isSaving = false;
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Projet created successfully!',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            this.updateMessage = '';
            this.router.navigate(['/GetProjet']);
          });
        },
        error: (error) => {
          console.error('Error creating projet:', error);
          this.isSaving = false;
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: `Error: ${error.statusText || 'Unknown error. Check server logs.'}`,
            timer: 3000,
            showConfirmButton: false
          });
        }
      });
    } else {
      this.updateMessage = 'Please fill all required fields.';
      setTimeout(() => this.updateMessage = '', 3000);
    }
  }

  cancel(): void {
    this.router.navigate(['/GetProjet']);
  }
}