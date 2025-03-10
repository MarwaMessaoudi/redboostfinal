import { Component, Inject, OnInit, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { PhaseService } from '../../services/phase.service';
import { Task, Priority, Status } from '../../models/task';
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

interface DialogData {
    phaseId: number;
    taskId: number;
    task: Task;
    isEdit: boolean;
}

interface Assignee {
    id: number;
    name: string;
    avatar?: string;
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
    phaseId: number | null = null;
    @ViewChild('fileInput') fileInput!: ElementRef;
    assignees: Assignee[] = [];

    // New properties for dropdowns and assignee display
    showPriorityDropdown: boolean = false;
    showAssigneeDropdown: boolean = false;

    constructor(
        private fb: FormBuilder,
        private taskService: TaskService,
        private phaseService: PhaseService,
        private route: ActivatedRoute,
        private router: Router,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<TaskFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {}

    ngOnInit(): void {
        this.initForm();
        this.loadPhases();
        this.loadAssignees();

        this.isEditMode = this.data.isEdit;
        this.phaseId = this.data.phaseId;
        this.taskId = this.data.taskId;

        if (this.isEditMode && this.taskId) {
            this.loadTask(this.taskId);
        } else if (this.phaseId) {
            this.taskForm.patchValue({ phase: { phaseId: this.phaseId } });
        }
    }

    initForm(): void {
        this.taskForm = this.fb.group({
            title: ['', [Validators.required]],
            xpPoint: [0, [Validators.required, Validators.min(0)]],
            description: [''],
            assigneeId: [null],
            startDate: ['', [Validators.required]],
            endDate: ['', [Validators.required]],
            priority: [Priority.MEDIUM, [Validators.required]],
            status: [Status.TO_DO],
            phase: this.fb.group({
                phaseId: [null, [Validators.required]]
            }),
            attachments: this.fb.array([])
        });
    }

    loadPhases(): void {
        this.phaseService.getAllPhases().subscribe({
            next: (phases) => {
                this.phases = phases;
            },
            error: (error) => {
                this.snackBar.open('Impossible de charger les phases', 'Fermer', { duration: 3000 });
                console.error('Erreur lors du chargement des phases :', error);
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
                console.error('Erreur lors du chargement de la tâche :', error);
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
            status: task.status,
            phase: {
                phaseId: task.phase.phaseId
            }
        });
        if (task.attachments && task.attachments.length > 0) {
            const attachmentsFormArray = this.fb.array(task.attachments);
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
                    console.error('Erreur lors de la mise à jour de la tâche :', error);
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
                    console.error('Erreur lors de la création de la tâche :', error);
                    this.snackBar.open('Impossible de créer la tâche', 'Fermer', { duration: 3000 });
                }
            });
        }
    }

    prepareTaskData(): Task {
        const formValues = this.taskForm.value;
        const startDate = formValues.startDate instanceof Date ? formValues.startDate.toISOString().split('T')[0] : formValues.startDate;
        const endDate = formValues.endDate instanceof Date ? formValues.endDate.toISOString().split('T')[0] : formValues.endDate;

        return {
            ...(this.isEditMode && this.taskId ? { taskId: this.taskId } : {}),
            title: formValues.title,
            xpPoint: formValues.xpPoint,
            description: formValues.description,
            assigneeId: formValues.assigneeId,
            startDate: startDate,
            endDate: endDate,
            priority: formValues.priority,
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

    // Load assignees
    loadAssignees(): void {
        this.assignees = [
            { id: 1, name: 'John Doe', avatar: 'assets/default-avatar.png' },
            { id: 2, name: 'Jane Smith', avatar: 'assets/default-avatar.png' },
            { id: 3, name: 'Peter Jones', avatar: 'assets/default-avatar.png' }
        ];
    }

    // Priority dropdown methods
    togglePriorityDropdown(): void {
        this.showPriorityDropdown = !this.showPriorityDropdown;
    }

    selectPriority(priority: Priority): void {
        this.taskForm.get('priority')?.setValue(priority);
        this.showPriorityDropdown = false;
    }

    // Assignee dropdown methods
    openAssigneeDropdown(): void {
        this.showAssigneeDropdown = !this.showAssigneeDropdown;
    }

    // Computed property to get the selected assignee
    get selectedAssignee(): Assignee | undefined {
        const assigneeId = this.taskForm.get('assigneeId')?.value;
        return this.assignees.find((a) => a.id === assigneeId);
    }
}
