// src/app/phase-form.component.ts
import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PhaseService } from '../../services/phase.service';
import { ProjetService } from '../../pages/Projet/projet-service.service';
import { Phase, PhaseStatus } from '../../models/phase';
import { Projet } from '../../models/Projet';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

interface DialogData {
    phase?: Phase;
    isEdit: boolean;
}

@Component({
    selector: 'app-phase-form',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDialogModule, MatDatepickerModule, MatNativeDateModule, MatButtonModule],
    templateUrl: './phase-form.component.html',
    styleUrls: ['./phase-form.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom
})
export class PhaseFormComponent implements OnInit {
    phaseForm!: FormGroup;
    isEditMode: boolean;
    loading = false;
    submitting = false;
    error = '';
    minDate: Date;
    minStartDate: Date;
    phaseStatusOptions = Object.values(PhaseStatus);
    projects: Projet[] = [];

    constructor(
        private fb: FormBuilder,
        private phaseService: PhaseService,
        private projetService: ProjetService,
        public dialogRef: MatDialogRef<PhaseFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.isEditMode = data.isEdit;
        this.minDate = new Date();
        this.minStartDate = this.minDate;
    }

    ngOnInit(): void {
        this.initForm();
        this.loadProjects();
        if (this.data.phase) {
            this.loadPhase(this.data.phase);
        }
    }

    initForm(): void {
        this.phaseForm = this.fb.group(
            {
                phaseName: ['', [Validators.required, Validators.maxLength(100)]],
                startDate: ['', Validators.required],
                endDate: ['', Validators.required],
                description: [''],
                projetId: [null, [Validators.required, Validators.min(1)]],
                status: [PhaseStatus.NOT_STARTED]
            },
            {
                validators: [this.dateRangeValidator.bind(this), this.startDateValidator.bind(this)]
            }
        );
    }

    loadProjects(): void {
        this.projetService.getUserProjects().subscribe({
            next: (projects) => {
                this.projects = projects;
            },
            error: (err) => {
                console.error('Error loading projects:', err);
                this.error = 'Impossible de charger les projets.';
            }
        });
    }

    loadPhase(phase: Phase): void {
        const startDate = phase.startDate ? new Date(phase.startDate).toISOString().split('T')[0] : '';
        const endDate = phase.endDate ? new Date(phase.endDate).toISOString().split('T')[0] : '';
        this.minStartDate = startDate ? new Date(startDate) : this.minDate;

        this.phaseForm.patchValue({
            phaseName: phase.phaseName,
            startDate: startDate,
            endDate: endDate,
            description: phase.description || '',
            projetId: phase.projetId,
            status: phase.status
        });
    }

    onSubmit(): void {
        console.log('Form Value:', this.phaseForm.value);
        if (this.phaseForm.invalid) {
            this.phaseForm.markAllAsTouched();
            console.log('Form is invalid:', this.phaseForm.errors);
            return;
        }

        this.submitting = true;
        const formValue = this.phaseForm.value;

        const startDate = new Date(formValue.startDate);
        const endDate = new Date(formValue.endDate);
        const normalizedStartDate = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
        const normalizedEndDate = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

        const phaseData: Phase = {
            ...(this.isEditMode && this.data.phase?.phaseId ? { phaseId: this.data.phase.phaseId } : {}),
            phaseName: formValue.phaseName,
            status: formValue.status,
            startDate: normalizedStartDate,
            endDate: normalizedEndDate,
            description: formValue.description,
            projetId: formValue.projetId
        };

        if (this.isEditMode && this.data.phase?.phaseId) {
            this.phaseService.updatePhase(this.data.phase.phaseId, phaseData).subscribe({
                next: () => {
                    this.submitting = false;
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    this.error = err.error?.error || 'Erreur lors de la mise à jour de la phase.';
                    if (err.status === 409) {
                        this.error = 'Conflit de données : vérifiez les informations saisies.';
                    }
                    this.submitting = false;
                    console.error('Erreur lors de la mise à jour :', err);
                }
            });
        } else {
            this.phaseService.createPhase(phaseData).subscribe({
                next: () => {
                    this.submitting = false;
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    this.error = err.error?.error || 'Erreur lors de la création de la phase.';
                    if (err.status === 409) {
                        this.error = 'Conflit de données : vérifiez que le projet existe et que tous les champs sont valides.';
                    }
                    this.submitting = false;
                    console.error('Erreur lors de la création :', err);
                }
            });
        }
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }

    get f() {
        return this.phaseForm.controls;
    }

    getFormControlClass(controlName: string): string {
        const control = this.phaseForm.get(controlName);
        if (control?.invalid && (control?.dirty || control?.touched)) {
            return 'is-invalid';
        }
        return '';
    }

    getErrorMessage(controlName: string): string {
        const control = this.phaseForm.get(controlName);
        if (control?.errors) {
            if (control.errors['required']) return 'Ce champ est obligatoire';
            if (control.errors['maxlength']) return `La longueur maximale est de ${control.errors['maxlength'].requiredLength} caractères`;
            if (control.errors['min']) return "L'ID du projet doit être supérieur à 0";
        }
        return '';
    }

    validateDates(): boolean {
        const startDate = new Date(this.phaseForm.value.startDate);
        const endDate = new Date(this.phaseForm.value.endDate);
        return startDate <= endDate;
    }

    startDateChanged(event: MatDatepickerInputEvent<Date>) {
        if (event.value) {
            this.minStartDate = event.value;
            this.phaseForm.updateValueAndValidity();
        }
    }

    dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
        const startDate = group.get('startDate')?.value;
        const endDate = group.get('endDate')?.value;
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (start > end) return { dateRangeInvalid: true };
        }
        return null;
    }

    startDateValidator(group: FormGroup): { [key: string]: any } | null {
        const startDate = group.get('startDate')?.value;
        const isEditMode = this.isEditMode;
        if (startDate && !isEditMode) {
            const start = new Date(startDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (start < today) return { startDateInPast: true };
        }
        return null;
    }
}
