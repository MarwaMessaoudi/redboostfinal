import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PhaseService } from '../../services/phase.service';
import { Phase, PhaseStatus } from '../../models/phase';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
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
    encapsulation: ViewEncapsulation.ShadowDom // Or ShadowDom
})
export class PhaseFormComponent implements OnInit {
    phaseForm!: FormGroup;
    isEditMode: boolean;
    loading = false;
    submitting = false;
    error = '';
    statuses = Object.values(PhaseStatus);
    minDate: Date; // Added property to store the minimum date
    minStartDate: Date;

    constructor(
        private fb: FormBuilder,
        private phaseService: PhaseService,
        public dialogRef: MatDialogRef<PhaseFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {
        this.isEditMode = data.isEdit;
        this.minDate = new Date(); // Set minDate to the current date
        this.minStartDate = this.minDate;
    }

    ngOnInit(): void {
        this.initForm();

        if (this.data.phase) {
            this.loadPhase(this.data.phase);
        }
    }

    initForm(): void {
        this.phaseForm = this.fb.group(
            {
                phaseName: ['', [Validators.required, Validators.maxLength(100)]],
                status: [PhaseStatus.NOT_STARTED, Validators.required],
                startDate: ['', Validators.required],
                endDate: ['', Validators.required],
                description: ['']
                // Removed totalXpPoints
            },
            { validators: [this.dateRangeValidator.bind(this), this.startDateValidator.bind(this)] }
        );
    }

    loadPhase(phase: Phase): void {
        // Format dates for the date input (YYYY-MM-DD)
        const startDate = phase.startDate ? new Date(phase.startDate).toISOString().split('T')[0] : '';
        const endDate = phase.endDate ? new Date(phase.endDate).toISOString().split('T')[0] : '';
        this.minStartDate = startDate ? new Date(startDate) : this.minDate;

        this.phaseForm.patchValue({
            phaseName: phase.phaseName,
            status: phase.status,
            startDate: startDate,
            endDate: endDate,
            description: phase.description || ''
            //Removed totalXpPoints
        });
    }

    onSubmit(): void {
        if (this.phaseForm.invalid) {
            this.phaseForm.markAllAsTouched();
            return;
        }

        this.submitting = true;
        const phaseData: Phase = this.phaseForm.value;

        if (this.isEditMode && this.data.phase?.phaseId) {
            // Update existing phase
            this.phaseService.updatePhase(this.data.phase.phaseId, phaseData).subscribe({
                next: () => {
                    this.submitting = false;
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    this.error = 'Impossible de mettre à jour la phase. Veuillez réessayer plus tard.';
                    this.submitting = false;
                    console.error('Erreur lors de la mise à jour de la phase :', err);
                }
            });
        } else {
            // Create new phase
            this.phaseService.createPhase(phaseData).subscribe({
                next: (newPhase) => {
                    this.submitting = false;
                    this.dialogRef.close(true);
                },
                error: (err) => {
                    this.error = 'Impossible de créer la phase. Veuillez réessayer plus tard.';
                    this.submitting = false;
                    console.error('Erreur lors de la création de la phase :', err);
                }
            });
        }
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }

    // Helper methods for form validation
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
            if (control.errors['required']) {
                return 'Ce champ est obligatoire';
            }
            if (control.errors['maxlength']) {
                return `La longueur maximale est de ${control.errors['maxlength'].requiredLength} caractères`;
            }
            if (control.errors['min']) {
                return `La valeur doit être d'au moins ${control.errors['min'].min}`;
            }
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
            // Force validation to trigger dateRangeValidator
            this.phaseForm.updateValueAndValidity();
        }
    }

    // Custom validator to ensure end date is after start date
    dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
        const startDate = group.get('startDate')?.value;
        const endDate = group.get('endDate')?.value;

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (start > end) {
                return { dateRangeInvalid: true };
            }
        }
        return null;
    }
    // Custom validator to ensure start date is not before today
    startDateValidator(group: FormGroup): { [key: string]: any } | null {
        const startDate = group.get('startDate')?.value;
        const isEditMode = this.isEditMode;

        if (startDate && !isEditMode) {
            const start = new Date(startDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Compare only dates

            if (start < today) {
                return { startDateInPast: true };
            }
        }
        return null;
    }
}
