import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild, Input, Output, EventEmitter, Renderer2, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../../service/task.service';
import { PhaseService } from '../../../service/phase.service';
import { TaskCategoryService } from '../../../service/taskCategory.service';
import { Task, Priority, Status, Attachment, TaskCategory, SubTask, Comment } from '../../../../models/task';
import { Phase, PhaseStatus } from '../../../../models/phase';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClient } from '@angular/common/http';

interface Assignee {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: string;
}

@Component({
    selector: 'app-task-update',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, MatIconModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule],
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
    editingXpPoint: boolean = false; // Added for XP Point editing
    showStatusDropdown: boolean = false;
    showPriorityDropdown: boolean = false;
    showAssigneeDropdown: boolean = false;

    availableAssignees: Assignee[] = [];
    availableCategories: TaskCategory[] = [];
    comments: Comment[] = [];
    selectedCategoryId: number | undefined;

    subTasks: SubTask[] = [];
    editingSubTaskIndex: number | null = null;
    newSubTask: SubTask = { title: '', description: '' };

    minStartDate: string = new Date().toISOString().split('T')[0];
    minEndDate: string = '';

    currentUser: any = null;

    constructor(
        private fb: FormBuilder,
        private taskService: TaskService,
        private phaseService: PhaseService,
        private taskCategoryService: TaskCategoryService,
        private snackBar: MatSnackBar,
        private renderer: Renderer2,
        private cdr: ChangeDetectorRef,
        private http: HttpClient
    ) {}

    ngOnInit(): void {
        this.initForm();
        this.updateMinEndDate();
        this.fetchCurrentUser();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['task'] && this.taskForm) {
            if (this.task && this.task.taskId) {
                this.loadTask(this.task.taskId);
            } else {
                this.task = {
                    taskId: undefined,
                    title: 'New Task',
                    xpPoint: 0,
                    priority: Priority.MEDIUM,
                    status: Status.TO_DO,
                    phase: {
                        phaseId: 1,
                        phaseName: 'Phase 1',
                        status: PhaseStatus.NOT_STARTED,
                        startDate: '',
                        endDate: ''
                    },
                    taskCategory: { id: undefined, name: '' },
                    startDate: '',
                    endDate: '',
                    subTasks: [],
                    comments: []
                } as Task;
                this.patchForm(this.task);
                this.loading = false;
                this.cdr.detectChanges();
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
            startDate: [null],
            endDate: [null],
            assigneeId: [null, [Validators.required]],
            categoryId: [null]
        });

        this.taskForm.get('startDate')?.valueChanges.subscribe((startDate) => {
            this.updateMinEndDate(startDate);
            this.taskForm.get('endDate')?.updateValueAndValidity();
        });
    }

    startDateFilter = (date: Date | null): boolean => {
        if (!date) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const phaseStart = this.task?.phase?.startDate ? new Date(this.task.phase.startDate) : null;
        const phaseEnd = this.task?.phase?.endDate ? new Date(this.task.phase.endDate) : null;
        if (phaseStart) phaseStart.setHours(0, 0, 0, 0);
        if (phaseEnd) phaseEnd.setHours(23, 59, 59, 999);
        const earliestAllowed = phaseStart && phaseStart > today ? phaseStart : today;
        return date >= earliestAllowed && (!phaseEnd || date <= phaseEnd);
    };

    endDateFilter = (date: Date | null): boolean => {
        if (!date) return true;
        const startDate = this.taskForm.get('startDate')?.value;
        const phaseEnd = this.task?.phase?.endDate ? new Date(this.task.phase.endDate) : null;
        if (phaseEnd) phaseEnd.setHours(23, 59, 59, 999);
        const start = startDate ? new Date(startDate) : null;
        if (start) start.setHours(0, 0, 0, 0);
        const earliestAllowed = start || new Date();
        return date >= earliestAllowed && (!phaseEnd || date <= phaseEnd);
    };

    fetchCurrentUser(): void {
        this.http.get('http://localhost:8085/users/profile').subscribe({
            next: (response: any) => {
                this.currentUser = response;
                console.log('Current user fetched:', this.currentUser);
            },
            error: (error) => {
                console.error('Failed to fetch current user:', error);
                this.snackBar.open('Failed to fetch user profile', 'Close', { duration: 3000 });
            }
        });
    }

    loadTask(id: number): void {
        this.loading = true;
        this.taskService.getTaskById(id).subscribe({
            next: (task) => {
                this.task = task;
                this.subTasks = task.subTasks || [];
                this.comments = task.comments || [];
                this.patchForm(task);
                this.selectedCategoryId = task.taskCategoryId;
                const projetId = task.phase?.projetId ?? 1;
                this.loadTaskAssignees(projetId);
                this.loadAvailableCategories();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                this.error = 'Failed to load task. Please try again later.';
                this.loading = false;
                this.snackBar.open('Failed to load task details', 'Close', { duration: 3000 });
                this.cdr.detectChanges();
            }
        });
    }

    patchForm(task: Task): void {
        const startDate = task.startDate ? new Date(task.startDate) : null;
        const endDate = task.endDate ? new Date(task.endDate) : null;

        this.taskForm.patchValue(
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

        if (this.task) {
            this.task.startDate = startDate?.toISOString().split('T')[0] || '';
            this.task.endDate = endDate?.toISOString().split('T')[0] || '';
        }
        this.cdr.detectChanges();
    }

    updateMinEndDate(startDate: Date | string | null = this.taskForm.get('startDate')?.value): void {
        if (startDate instanceof Date) {
            this.minEndDate = startDate.toISOString().split('T')[0];
        } else if (typeof startDate === 'string' && startDate.length === 10) {
            this.minEndDate = startDate;
        } else {
            this.minEndDate = this.minStartDate;
        }
    }

    loadTaskAssignees(projectId: number): void {
        this.phaseService.getEntrepreneursByProject(projectId).subscribe({
            next: (entrepreneurs) => {
                this.availableAssignees = entrepreneurs;
                this.cdr.detectChanges();
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
                if (this.task && this.task.taskCategoryId !== undefined) {
                    this.selectedCategoryId = this.task.taskCategoryId;
                }
                this.cdr.detectChanges();
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
                    this.task = { ...updatedTask };
                    this.subTasks = updatedTask.subTasks || [];
                    this.comments = updatedTask.comments || [];
                    this.selectedCategoryId = updatedTask.taskCategoryId;
                    this.patchForm(this.task);
                    this.submitting = false;
                    this.taskUpdated.emit(this.task);
                    this.snackBar.open('Task updated successfully', 'Close', { duration: 3000 });
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    this.error = 'Failed to update task. Please try again later.';
                    this.submitting = false;
                    this.snackBar.open('Failed to update task', 'Close', { duration: 3000 });
                    this.cdr.detectChanges();
                }
            });
        } else {
            this.taskService.createTask(taskData).subscribe({
                next: (newTask) => {
                    this.submitting = false;
                    this.task = newTask;
                    this.subTasks = newTask.subTasks || [];
                    this.comments = newTask.comments || [];
                    this.taskUpdated.emit(newTask);
                    this.close();
                    this.snackBar.open('Task created successfully', 'Close', { duration: 3000 });
                },
                error: (error) => {
                    this.error = 'Failed to create task. Please try again later.';
                    this.submitting = false;
                    this.snackBar.open('Failed to create task', 'Close', { duration: 3000 });
                    this.cdr.detectChanges();
                }
            });
        }
    }

    prepareTaskData(): Task {
        const formValues = this.taskForm.value;
        const selectedCategory = this.availableCategories.find((cat) => cat.id === this.selectedCategoryId);

        return {
            ...(this.task && this.task.taskId ? { taskId: this.task.taskId } : {}),
            title: formValues.title,
            description: formValues.description,
            priority: formValues.priority,
            status: formValues.status,
            phase: this.task?.phase,
            taskCategoryId: this.selectedCategoryId,
            taskCategory: selectedCategory || this.task?.taskCategory,
            attachments: this.task?.attachments,
            xpPoint: formValues.xpPoint,
            startDate: formValues.startDate ? formValues.startDate.toISOString().split('T')[0] : undefined,
            endDate: formValues.endDate ? formValues.endDate.toISOString().split('T')[0] : undefined,
            assigneeId: formValues.assigneeId,
            subTasks: this.subTasks,
            comments: this.comments
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
                this.cdr.detectChanges();
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

    startEditingXpPoint(): void {
        this.editingXpPoint = true;
    }

    saveXpPoint(): void {
        const xpPointValue = this.taskForm.value.xpPoint;
        if (xpPointValue < 0) {
            this.snackBar.open('XP Points cannot be negative', 'Close', { duration: 3000 });
            return;
        }

        if (this.task) {
            this.task.xpPoint = xpPointValue;
            this.editingXpPoint = false;
            this.onSubmit();
        }
    }

    cancelEditXpPoint(): void {
        if (this.task) {
            this.taskForm.patchValue({ xpPoint: this.task.xpPoint });
        }
        this.editingXpPoint = false;
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
        if (!commentValue?.trim() || !this.task?.taskId || !this.currentUser) {
            this.snackBar.open('Comment cannot be empty or user not loaded', 'Close', { duration: 3000 });
            return;
        }

        const newComment: Comment = {
            content: commentValue,
            profilePictureUrl: this.currentUser.profile_pictureurl,
            firstName: this.currentUser.firstName,
            lastName: this.currentUser.lastName,
            userId: this.currentUser.id
        };

        this.taskService.addCommentToTask(this.task.taskId, newComment).subscribe({
            next: (updatedTask) => {
                this.task = updatedTask;
                this.comments = updatedTask.comments || [];
                this.taskForm.patchValue({ comment: '' });
                this.snackBar.open('Comment added successfully', 'Close', { duration: 3000 });
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Failed to add comment:', error);
                this.snackBar.open('Failed to add comment', 'Close', { duration: 3000 });
            }
        });
    }

    trackByAttachments(index: number, attachment: Attachment): string {
        return attachment.name;
    }

    downloadAttachment(attachment: Attachment) {
        if (!this.task?.taskId) return;
        this.taskService.downloadAttachment(this.task.taskId, attachment.name).subscribe({
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
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.loading = false;
                this.snackBar.open('Failed to delete attachment.', 'Close', { duration: 3000 });
                this.taskService.getTaskById(this.task!.taskId!).subscribe((task) => {
                    this.task = task;
                    this.patchForm(task);
                    this.cdr.detectChanges();
                });
            }
        });
    }

    saveStartDate(): void {
        if (this.task) {
            const startDate = this.taskForm.value.startDate;
            this.task.startDate = startDate ? startDate.toISOString().split('T')[0] : '';
            this.onSubmit();
        }
    }

    cancelEditStartDate(): void {
        if (this.task) {
            this.taskForm.patchValue({ startDate: this.task.startDate ? new Date(this.task.startDate) : null });
        }
    }

    saveEndDate(): void {
        if (this.task) {
            const endDate = this.taskForm.value.endDate;
            this.task.endDate = endDate ? endDate.toISOString().split('T')[0] : '';
            this.onSubmit();
        }
    }

    cancelEditEndDate(): void {
        if (this.task) {
            this.taskForm.patchValue({ endDate: this.task.endDate ? new Date(this.task.endDate) : null });
        }
    }

    addSubTask(): void {
        if (this.newSubTask.title.trim()) {
            this.subTasks.push({ ...this.newSubTask });
            this.newSubTask = { title: '', description: '' };
            this.onSubmit();
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
            this.onSubmit();
        } else {
            this.snackBar.open('Sub-task title is required', 'Close', { duration: 3000 });
        }
    }

    cancelEditSubTask(index: number): void {
        this.editingSubTaskIndex = null;
    }

    deleteSubTask(index: number): void {
        this.subTasks.splice(index, 1);
        this.onSubmit();
    }
}