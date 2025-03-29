import { Component, Inject, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { PhaseService } from '../../services/phase.service';
import { TaskCategoryService } from '../../services/taskCategory.service';
import { Task, Priority, Status, TaskCategory } from '../../models/task';
import { Phase } from '../../models/phase';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { User } from '../../models/user';

interface DialogData {
    phaseId: number;
    taskId?: number; // Optional for create mode
    task?: Task; // Optional for edit mode
    isEdit: boolean;
    entrepreneurs: User[];
    phase?: Phase; // Add phase to pass startDate and endDate
}

@Component({
    selector: 'app-task-form',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatProgressBarModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatDatepickerModule,
        MatDialogModule,
        MatIconModule,
        MatListModule,
        MatCardModule,
        MatSnackBarModule
    ],
    templateUrl: './task-form.component.html',
    styleUrls: ['./task-form.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom
})
export class TaskFormComponent implements OnInit {
    taskForm!: FormGroup;
    taskId: number | null = null;
    isEditMode = false;
    loading = false;
    submitting = false;
    error = '';
    priorityOptions = Object.values(Priority);
    statusOptions = Object.values(Status);
    phases: Phase[] = [];
    taskCategories: TaskCategory[] = [];
    phaseId: number | null = null;
    @ViewChild('fileInput') fileInput!: ElementRef;

    // Minimum date (today)
    minStartDate: Date = new Date();

    constructor(
        private fb: FormBuilder,
        private taskService: TaskService,
        private phaseService: PhaseService,
        private taskCategoryService: TaskCategoryService,
        private route: ActivatedRoute,
        private router: Router,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<TaskFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {}

    ngOnInit(): void {
        this.initForm();
        this.loadPhases();
        this.loadTaskCategories();

        this.isEditMode = this.data.isEdit;
        this.phaseId = this.data.phaseId;
        this.taskId = this.data.taskId ?? null;

        if (this.isEditMode && this.taskId) {
            this.loadTask(this.taskId);
        } else if (this.phaseId) {
            this.taskForm.patchValue({ phase: { phaseId: this.phaseId } });
        }

        // Add listener to update end date filter when start date changes
        this.taskForm.get('startDate')?.valueChanges.subscribe(() => {
            this.taskForm.get('endDate')?.updateValueAndValidity();
        });
    }

    initForm(): void {
        this.taskForm = this.fb.group({
            title: ['', [Validators.required]],
            xpPoint: [0, [Validators.required, Validators.min(0)]],
            description: [''],
            assigneeId: [null, [Validators.required]],
            startDate: ['', [Validators.required]],
            endDate: ['', [Validators.required]],
            priority: [Priority.MEDIUM, [Validators.required]],
            taskCategory: [null, [Validators.required]],
            status: [Status.TO_DO],
            phase: this.fb.group({
                phaseId: [null, [Validators.required]]
            }),
            attachments: this.fb.array([])
        });
    }

    // Date filters with phase constraints
    startDateFilter = (date: Date | null): boolean => {
        if (!date) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const phaseStart = this.data.phase?.startDate ? new Date(this.data.phase.startDate) : null;
        const phaseEnd = this.data.phase?.endDate ? new Date(this.data.phase.endDate) : null;
        if (phaseStart) phaseStart.setHours(0, 0, 0, 0);
        if (phaseEnd) phaseEnd.setHours(23, 59, 59, 999); // End of the day
        const earliestAllowed = phaseStart && phaseStart > today ? phaseStart : today;
        return date >= earliestAllowed && (!phaseEnd || date <= phaseEnd);
    };

    endDateFilter = (date: Date | null): boolean => {
        if (!date) return true;
        const startDate = this.taskForm.get('startDate')?.value;
        const phaseEnd = this.data.phase?.endDate ? new Date(this.data.phase.endDate) : null;
        if (phaseEnd) phaseEnd.setHours(23, 59, 59, 999); // End of the day
        const start = startDate ? new Date(startDate) : null;
        if (start) start.setHours(0, 0, 0, 0);
        const earliestAllowed = start || new Date();
        return date >= earliestAllowed && (!phaseEnd || date <= phaseEnd);
    };

    loadPhases(): void {
        this.phaseService.getAllPhases().subscribe({
            next: (phases) => {
                this.phases = phases;
            },
            error: (error) => {
                this.snackBar.open('Impossible de charger les phases', 'Fermer', { duration: 3000 });
                console.error('Erreur lors du chargement des phases :', error);
            }
        });
    }

    loadTaskCategories(): void {
        this.taskCategoryService.getAllTaskCategories().subscribe({
            next: (categories) => {
                this.taskCategories = categories;
            },
            error: (error) => {
                this.snackBar.open('Impossible de charger les catégories', 'Fermer', { duration: 3000 });
                console.error('Erreur lors du chargement des catégories :', error);
            }
        });
    }

    loadTask(id: number): void {
        this.loading = true;
        this.taskService.getTaskById(id).subscribe({
            next: (task) => {
                this.patchForm(task);
                this.loading = false;
            },
            error: (error) => {
                this.error = 'Impossible de charger la tâche. Veuillez réessayer plus tard.';
                this.loading = false;
                console.error('Erreur lors du chargement de la tâche :', error);
                this.snackBar.open('Impossible de charger les détails de la tâche', 'Fermer', { duration: 3000 });
            }
        });
    }

    patchForm(task: Task): void {
        this.taskForm.patchValue({
            title: task.title,
            xpPoint: task.xpPoint,
            description: task.description,
            assigneeId: task.assigneeId,
            startDate: task.startDate ? new Date(task.startDate) : null,
            endDate: task.endDate ? new Date(task.endDate) : null,
            priority: task.priority,
            taskCategory: task.taskCategory?.id || null,
            status: task.status,
            phase: {
                phaseId: task.phase.phaseId
            }
        });
        if (task.attachments && task.attachments.length > 0) {
            const attachmentsFormArray = this.fb.array(task.attachments.map((att) => this.fb.control(att.name)));
            this.taskForm.setControl('attachments', attachmentsFormArray);
        }
    }

    onSubmit(): void {
        if (this.taskForm.invalid) {
            this.markFormGroupTouched(this.taskForm);
            this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', { duration: 3000 });
            return;
        }

        this.submitting = true;
        const taskData = this.prepareTaskData();

        if (this.isEditMode && this.taskId) {
            this.taskService.updateTask(this.taskId, taskData).subscribe({
                next: () => {
                    this.submitting = false;
                    this.dialogRef.close(true);
                    this.snackBar.open('Tâche mise à jour avec succès', 'Fermer', { duration: 3000 });
                },
                error: (error) => {
                    this.error = 'Impossible de mettre à jour la tâche. Veuillez réessayer plus tard.';
                    this.submitting = false;
                    console.error('Erreur lors de la mise à jour de la tâche :', error);
                    this.snackBar.open('Impossible de mettre à jour la tâche', 'Fermer', { duration: 3000 });
                }
            });
        } else {
            this.taskService.createTask(taskData).subscribe({
                next: () => {
                    this.submitting = false;
                    this.dialogRef.close(true);
                    this.snackBar.open('Tâche créée avec succès', 'Fermer', { duration: 3000 });
                },
                error: (error) => {
                    this.error = 'Impossible de créer la tâche. Veuillez réessayer plus tard.';
                    this.submitting = false;
                    console.error('Erreur lors de la création de la tâche :', error);
                    this.snackBar.open('Impossible de créer la tâche', 'Fermer', { duration: 3000 });
                }
            });
        }
    }

    prepareTaskData(): Task {
        const formValues = this.taskForm.value;

        // Normalize dates to YYYY-MM-DD using local time
        const startDate = new Date(formValues.startDate);
        const endDate = new Date(formValues.endDate);
        const normalizedStartDate = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
        const normalizedEndDate = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

        return {
            ...(this.isEditMode && this.taskId ? { taskId: this.taskId } : {}),
            title: formValues.title,
            xpPoint: formValues.xpPoint,
            description: formValues.description,
            assigneeId: formValues.assigneeId,
            startDate: normalizedStartDate,
            endDate: normalizedEndDate,
            priority: formValues.priority,
            taskCategory: { id: formValues.taskCategory },
            status: Status.TO_DO,
            phase: {
                phaseId: formValues.phase.phaseId
            },
            attachments: formValues.attachments || []
        } as Task;
    }

    markFormGroupTouched(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach((key) => {
            const control = formGroup.get(key);
            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            } else {
                control?.markAsTouched();
            }
        });
    }

    getPhaseName(phaseId: number): string {
        const phase = this.phases.find((p) => p.phaseId === phaseId);
        return phase ? phase.phaseName : 'Inconnu';
    }

    getErrorMessage(controlName: string): string {
        const control = this.taskForm.get(controlName);
        if (control?.hasError('required')) {
            return 'Ce champ est obligatoire';
        }
        if (control?.hasError('min')) {
            return 'La valeur doit être supérieure ou égale à 0';
        }
        return '';
    }

    // Attachment handling
    removeAttachment(index: number): void {
        const attachments = this.taskForm.get('attachments') as FormArray;
        attachments.removeAt(index);
    }

    get attachmentControls(): FormArray {
        return this.taskForm.get('attachments') as FormArray;
    }

    addAttachment(): void {
        this.fileInput.nativeElement.click();
    }

    onFileSelected(event: any): void {
        const files: FileList = event.target.files;
        if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                (this.taskForm.get('attachments') as FormArray).push(this.fb.control(file.name));
            }
        }
        this.fileInput.nativeElement.value = '';
    }
}
