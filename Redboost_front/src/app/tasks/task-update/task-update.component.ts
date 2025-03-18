import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild, Input, Output, EventEmitter, Renderer2, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { PhaseService } from '../../services/phase.service';
import { TaskCategoryService } from '../../services/taskCategory.service';
import { Task, Priority, Status, Attachment, TaskCategory, SubTask } from '../../models/task';
import { Phase, PhaseStatus } from '../../models/phase'; // Import Phase and PhaseStatus
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

interface Assignee {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: string;
}

interface Comment {
    id: number;
    authorName: string;
    authorAvatar?: string;
    content: string;
    createdAt: Date;
}

@Component({
    selector: 'app-task-update',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, MatIconModule, MatSnackBarModule, MatFormFieldModule, MatSelectModule],
    templateUrl: './task-update.component.html',
    styleUrls: ['./task-update.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TaskUpdateComponent implements OnInit {
    taskForm!: FormGroup;
    @Input() task: Task | null = null;
    @Input() isOpen: boolean = false;
    @Output() closeEvent = new EventEmitter<boolean>();
    @Output() taskUpdated = new EventEmitter<Task>();

    taskId: number | null = null;
    isEditMode = true;
    loading = false;
    submitting = false;
    error = '';
    priorityOptions = Object.values(Priority);
    statusOptions = Object.values(Status);

    @ViewChild('fileInput') fileInput!: ElementRef;

    editingTitle: boolean = false;
    editingDescription: boolean = false;
    editingCategory: boolean = false;
    showStatusDropdown: boolean = false;
    showPriorityDropdown: boolean = false;
    showAssigneeDropdown: boolean = false;

    availableAssignees: Assignee[] = [];
    availableCategories: TaskCategory[] = [];
    comments: Comment[] = [];
    selectedCategoryId: number | undefined;

    subTasks: SubTask[] = []; // List of sub-tasks
    editingSubTaskIndex: number | null = null; // Index of sub-task being edited
    newSubTask: SubTask = { title: '', description: '' }; // New sub-task input

    minStartDate: string = new Date().toISOString().split('T')[0];
    minEndDate: string = '';

    constructor(
        private fb: FormBuilder,
        private taskService: TaskService,
        private phaseService: PhaseService,
        private taskCategoryService: TaskCategoryService,
        private snackBar: MatSnackBar,
        private renderer: Renderer2,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.initForm();
        this.updateMinEndDate();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['task'] && this.taskForm) {
            if (this.task && this.task.taskId) {
                this.loadTask(this.task.taskId);
            } else {
                this.task = {
                    taskId: 1,
                    title: 'New Task',
                    xpPoint: 0,
                    priority: Priority.MEDIUM,
                    status: Status.TO_DO,
                    phase: {
                        phaseId: 1,
                        phaseName: 'Phase 1',
                        status: PhaseStatus.NOT_STARTED, // Use enum value
                        startDate: '', // Required field
                        endDate: '' // Required field
                    },
                    taskCategory: { id: undefined, name: '' },
                    startDate: '',
                    endDate: '',
                    subTasks: []
                } as Task;
                this.patchForm(this.task);
            }
        }
    }

    initForm(): void {
        this.taskForm = this.fb.group({
            title: ['', [Validators.required]],
            description: [''],
            comments: [''],
            priority: [Priority.MEDIUM, [Validators.required]],
            status: [Status.TO_DO],
            comment: [''],
            xpPoint: [0, [Validators.min(0)]],
            startDate: [''],
            endDate: [''],
            assigneeId: [null, [Validators.required]],
            categoryId: [null]
        });

        this.taskForm.get('startDate')?.valueChanges.subscribe((startDate) => {
            this.updateMinEndDate(startDate);
        });
    }

    loadTask(id: number): void {
        this.loading = true;
        this.taskService.getTaskById(id).subscribe({
            next: (task) => {
                this.task = task;
                this.subTasks = task.subTasks || []; // Load sub-tasks
                this.patchForm(task);
                this.selectedCategoryId = task.taskCategoryId;
                console.log('Task loaded - taskCategoryId:', this.task.taskCategoryId);
                console.log('Task loaded - subTasks:', this.subTasks);

                const projetId = task.phase?.projetId;
                if (projetId !== null && projetId !== undefined) {
                    this.loadTaskAssignees(projetId);
                } else {
                    this.loadTaskAssignees(1);
                }
                this.loadAvailableCategories();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.error = 'Failed to load task. Please try again later.';
                this.loading = false;
                this.snackBar.open('Failed to load task details', 'Close', { duration: 3000 });
            }
        });
    }

    patchForm(task: Task): void {
        const startDate = task.startDate && task.startDate.length === 10 ? task.startDate : '';
        const endDate = task.endDate && task.endDate.length === 10 ? task.endDate : '';

        this.taskForm?.patchValue(
            {
                title: task.title || '',
                description: task.description || '',
                comments: task.comments || '',
                priority: task.priority || Priority.MEDIUM,
                status: task.status || Status.TO_DO,
                comment: '',
                xpPoint: task.xpPoint || 0,
                startDate: startDate,
                endDate: endDate,
                assigneeId: task.assigneeId || null,
                categoryId: task.taskCategoryId || null
            },
            { emitEvent: false }
        );

        this.task!.startDate = startDate;
        this.task!.endDate = endDate;
        this.cdr.detectChanges();
    }

    updateMinEndDate(startDate: string = this.taskForm.get('startDate')?.value): void {
        this.minEndDate = startDate && startDate.length === 10 ? startDate : this.minStartDate;
    }

    loadTaskAssignees(projectId: number): void {
        this.phaseService.getEntrepreneursByProject(projectId).subscribe({
            next: (entrepreneurs) => {
                this.availableAssignees = entrepreneurs;
            },
            error: (error) => {
                this.snackBar.open('Failed to load assignees', 'Close', { duration: 3000 });
            }
        });
    }

    loadAvailableCategories(): void {
        this.taskCategoryService.getAllTaskCategories().subscribe({
            next: (categories) => {
                this.availableCategories = categories;
                console.log('Available categories loaded:', this.availableCategories);
                if (this.task && this.task.taskCategoryId !== undefined) {
                    this.selectedCategoryId = this.task.taskCategoryId;
                }
            },
            error: (err) => {
                console.error('Error fetching categories:', err);
                this.snackBar.open('Failed to load categories', 'Close', { duration: 3000 });
            }
        });
    }

    getCategoryName(categoryId: number | undefined): string {
        if (categoryId === undefined || categoryId === null) {
            return 'Aucune catégorie';
        }
        const category = this.availableCategories.find((cat) => cat.id === categoryId);
        return category ? category.name : 'Catégorie inconnue';
    }

    onSubmit(): void {
        if (this.taskForm.invalid) {
            this.markFormGroupTouched(this.taskForm);
            this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
            return;
        }

        this.submitting = true;
        const taskData = this.prepareTaskData();

        if (this.task && this.task.taskId) {
            this.taskService.updateTask(this.task.taskId, taskData).subscribe({
                next: (updatedTask) => {
                    console.log('Server response - updatedTask:', updatedTask);
                    this.task = { ...updatedTask };
                    this.subTasks = updatedTask.subTasks || []; // Update sub-tasks
                    this.selectedCategoryId = updatedTask.taskCategoryId;
                    this.patchForm(this.task);
                    console.log('After update - this.task.taskCategoryId:', this.task.taskCategoryId);
                    this.submitting = false;
                    this.taskUpdated.emit(this.task);
                    this.snackBar.open('Task updated successfully', 'Close', { duration: 3000 });
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    this.error = 'Failed to update task. Please try again later.';
                    this.submitting = false;
                    this.snackBar.open('Failed to update task', 'Close', { duration: 3000 });
                }
            });
        } else {
            this.taskService.createTask(taskData).subscribe({
                next: (newTask) => {
                    this.submitting = false;
                    this.task = newTask;
                    this.subTasks = newTask.subTasks || [];
                    this.taskUpdated.emit(newTask);
                    this.close();
                    this.snackBar.open('Task created successfully', 'Close', { duration: 3000 });
                },
                error: (error) => {
                    this.error = 'Failed to create task. Please try again later.';
                    this.submitting = false;
                    this.snackBar.open('Failed to create task', 'Close', { duration: 3000 });
                }
            });
        }
    }

    prepareTaskData(): Task {
        const formValues = this.taskForm.value;
        const selectedCategory = this.availableCategories.find((cat) => cat.id === this.selectedCategoryId);

        console.log('Preparing task data - selectedCategoryId:', this.selectedCategoryId);
        console.log('Preparing task data - subTasks:', this.subTasks);

        return {
            ...(this.task && this.task.taskId ? { taskId: this.task.taskId } : {}),
            title: formValues.title,
            description: formValues.description,
            comments: formValues.comments,
            priority: formValues.priority,
            status: formValues.status,
            phase: this.task?.phase,
            taskCategoryId: this.selectedCategoryId,
            taskCategory: selectedCategory || this.task?.taskCategory,
            attachments: this.task?.attachments,
            xpPoint: formValues.xpPoint,
            startDate: formValues.startDate || undefined,
            endDate: formValues.endDate || undefined,
            assigneeId: formValues.assigneeId,
            subTasks: this.subTasks // Include sub-tasks
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

    deleteTask(): void {
        if (!this.task || !this.task.taskId) return;

        this.loading = true;
        this.taskService.deleteTask(this.task.taskId).subscribe({
            next: () => {
                this.loading = false;
                this.snackBar.open('Task deleted successfully', 'Close', { duration: 3000 });
                this.close();
            },
            error: (error) => {
                this.loading = false;
                this.snackBar.open('Failed to delete task', 'Close', { duration: 3000 });
            }
        });
    }

    close() {
        this.closeEvent.emit(false);
    }

    startEditingTitle(): void {
        this.editingTitle = true;
    }

    saveTitle(): void {
        if (!this.taskForm.value.title) {
            this.snackBar.open('Title cannot be empty', 'Close', { duration: 3000 });
            return;
        }

        if (this.task) {
            this.task.title = this.taskForm.value.title;
        }
        this.editingTitle = false;
        this.onSubmit();
    }

    cancelEditTitle(): void {
        if (this.task) {
            this.taskForm.patchValue({ title: this.task.title });
        }
        this.editingTitle = false;
    }

    startEditingDescription(): void {
        this.editingDescription = true;
    }

    saveDescription(): void {
        if (this.task) {
            this.task.description = this.taskForm.value.description;
        }
        this.editingDescription = false;
        this.onSubmit();
    }

    cancelEditDescription(): void {
        if (this.task) {
            this.taskForm.patchValue({ description: this.task.description });
        }
        this.editingDescription = false;
    }

    toggleStatusDropdown(): void {
        this.showStatusDropdown = !this.showStatusDropdown;
    }

    togglePriorityDropdown(): void {
        this.showPriorityDropdown = !this.showPriorityDropdown;
    }

    selectStatus(status: Status): void {
        if (this.task) {
            this.task.status = status;
            this.taskForm.patchValue({ status });
            this.showStatusDropdown = false;
            this.onSubmit();
        }
    }

    selectPriority(priority: Priority): void {
        if (this.task) {
            this.task.priority = priority;
            this.taskForm.patchValue({ priority });
            this.showPriorityDropdown = false;
            this.onSubmit();
        }
    }

    openAssigneeDropdown(): void {
        this.showAssigneeDropdown = !this.showAssigneeDropdown;
    }

    selectAssignee(assignee: Assignee): void {
        if (this.task) {
            this.task.assigneeId = assignee.id;
            this.taskForm.patchValue({ assigneeId: assignee.id });
            this.onSubmit();
            this.showAssigneeDropdown = false;
        }
    }

    startEditingCategory(): void {
        this.loadAvailableCategories();
        this.editingCategory = true;
    }

    saveTaskCategory(): void {
        if (this.task && this.selectedCategoryId !== undefined) {
            this.task.taskCategoryId = this.selectedCategoryId;
            this.taskForm.get('categoryId')?.setValue(this.selectedCategoryId);
            console.log('Before save - task.taskCategoryId:', this.task.taskCategoryId);
            this.onSubmit();
            this.editingCategory = false;
        } else {
            this.snackBar.open('Aucune catégorie sélectionnée', 'Close', { duration: 3000 });
            this.editingCategory = false;
        }
    }

    cancelEditTaskCategory(): void {
        if (this.task && this.task.taskCategoryId !== undefined) {
            this.selectedCategoryId = this.task.taskCategoryId;
        } else {
            this.selectedCategoryId = undefined;
        }
        this.editingCategory = false;
    }

    getAssigneeName(assigneeId: number | undefined): string {
        if (!assigneeId) return 'Aucun responsable';
        const assignee = this.availableAssignees.find((a) => a.id === assigneeId);
        return assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Aucun responsable';
    }

    addComment(): void {
        const commentValue = this.taskForm.value.comment;
        if (!commentValue?.trim()) {
            return;
        }

        const newComment: Comment = {
            id: Date.now(),
            authorName: 'Current User',
            authorAvatar: 'assets/default-avatar.png',
            content: commentValue,
            createdAt: new Date()
        };

        this.comments.unshift(newComment);
        this.taskForm.patchValue({ comment: '' });
    }

    trackByAttachments(index: number, attachment: Attachment): string {
        return attachment.name;
    }

    downloadAttachment(attachment: Attachment) {
        this.taskService.downloadAttachment(this.task!.taskId!, attachment.name).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = attachment.name;
                link.click();
                window.URL.revokeObjectURL(url);
            },
            error: (err) => {
                this.snackBar.open('Failed to download attachment.', 'Close', { duration: 3000 });
            }
        });
    }

    deleteAttachment(attachment: Attachment) {
        if (!this.task || !this.task.taskId) return;

        this.task.attachments = this.task.attachments?.filter((att) => att.name !== attachment.name) || [];

        this.loading = true;
        this.taskService.updateTask(this.task.taskId, this.task).subscribe({
            next: (updatedTask) => {
                this.task = updatedTask;
                this.loading = false;
                this.taskUpdated.emit(updatedTask);
                this.snackBar.open('Attachment deleted successfully.', 'Close', { duration: 2000 });
            },
            error: (err) => {
                this.loading = false;
                this.snackBar.open('Failed to delete attachment.', 'Close', { duration: 3000 });
                this.taskService.getTaskById(this.task!.taskId!).subscribe((task) => {
                    this.task = task;
                    this.patchForm(task);
                });
            }
        });
    }

    saveStartDate(): void {
        if (this.task) {
            this.task.startDate = this.taskForm.value.startDate;
            this.onSubmit();
        }
    }

    cancelEditStartDate(): void {
        if (this.task) {
            this.taskForm.patchValue({ startDate: this.task.startDate || '' });
        }
    }

    saveEndDate(): void {
        if (this.task) {
            this.task.endDate = this.taskForm.value.endDate;
            this.onSubmit();
        }
    }

    cancelEditEndDate(): void {
        if (this.task) {
            this.taskForm.patchValue({ endDate: this.task.endDate || '' });
        }
    }

    // Sub-task methods
    addSubTask(): void {
        if (this.newSubTask.title.trim()) {
            this.subTasks.push({ ...this.newSubTask });
            this.newSubTask = { title: '', description: '' }; // Reset form
            this.onSubmit(); // Save immediately
        } else {
            this.snackBar.open('Sub-task title is required', 'Close', { duration: 3000 });
        }
    }

    startEditingSubTask(index: number): void {
        this.editingSubTaskIndex = index;
    }

    saveSubTask(index: number): void {
        if (this.subTasks[index].title.trim()) {
            this.editingSubTaskIndex = null;
            this.onSubmit(); // Save changes
        } else {
            this.snackBar.open('Sub-task title is required', 'Close', { duration: 3000 });
        }
    }

    cancelEditSubTask(index: number): void {
        this.editingSubTaskIndex = null;
    }

    deleteSubTask(index: number): void {
        this.subTasks.splice(index, 1);
        this.onSubmit(); // Save changes
    }
}
