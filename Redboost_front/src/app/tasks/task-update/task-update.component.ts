import { Component, OnInit, ViewEncapsulation, ElementRef, ViewChild, Input, Output, EventEmitter, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { PhaseService } from '../../services/phase.service';
import { Task, Priority, Status, Attachment } from '../../models/task';
import { Phase } from '../../models/phase';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { Observable } from 'rxjs';

interface Assignee {
    id: number;
    name: string;
    avatar?: string;
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
    imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, MatSnackBarModule, MatIconModule, MatDatepickerModule, MatInputModule, MatNativeDateModule],
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
    phases: Phase[] = [];
    phaseId: number | null = null;
    @ViewChild('fileInput') fileInput!: ElementRef;
    selectedStartDate: any;
    selectedEndDate: any;

    // UI state properties
    editingTitle: boolean = false;
    editingDescription: boolean = false;
    showStatusDropdown: boolean = false;
    showPriorityDropdown: boolean = false;
    showAssigneeDropdown: boolean = false;

    // Will be populated from actual data later
    assignees: Assignee[] = [];
    availableAssignees: Assignee[] = [];
    comments: Comment[] = [];

    constructor(
        private fb: FormBuilder,
        private taskService: TaskService,
        private phaseService: PhaseService,
        private route: ActivatedRoute,
        private router: Router,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.initForm();
        this.loadAvailableAssignees();
    }

    ngOnChanges(): void {
        if (this.task && this.task.taskId) {
            this.loadTask(this.task.taskId);
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
            endDate: ['']
        });
    }

    loadTask(id: number): void {
        this.loading = true;
        this.taskService.getTaskById(id).subscribe({
            next: (task) => {
                this.task = task;
                this.patchForm(task);
                if (task.taskId) {
                    this.loadTaskAssignees(task.taskId);
                    this.loadTaskComments(task.taskId);
                }
                this.loading = false;
                console.log('Task loaded successfully:', this.task);
            },
            error: (error) => {
                this.error = 'Failed to load task. Please try again later.';
                this.loading = false;
                console.error('Error loading task:', error);
                this.snackBar.open('Failed to load task details', 'Close', { duration: 3000 });
            }
        });
    }

    patchForm(task: Task): void {
        this.taskForm.patchValue({
            title: task.title,
            description: task.description,
            comments: task.comments,
            priority: task.priority,
            status: task.status,
            xpPoint: task.xpPoint,
            startDate: task.startDate,
            endDate: task.endDate
        });
    }

    loadAvailableAssignees(): void {
        // Replace with actual service call to get all available assignees
        this.availableAssignees = [
            { id: 1, name: 'Assignee 1', avatar: 'assets/default-avatar.png' },
            { id: 2, name: 'Assignee 2', avatar: 'assets/default-avatar.png' },
            { id: 3, name: 'Assignee 3', avatar: 'assets/default-avatar.png' },
            { id: 4, name: 'Assignee 4', avatar: 'assets/default-avatar.png' }
        ];
    }

    loadTaskAssignees(taskId: number): void {
        this.taskService.getAssigneesForTask(taskId).subscribe({
            next: (assignees: Assignee[]) => {
                this.assignees = assignees;
            },
            error: (error: any) => {
                console.error('Error loading assignees:', error);
                this.snackBar.open('Failed to load assignees', 'Close', { duration: 3000 });
            }
        });
    }

    loadTaskComments(taskId: number): void {
        this.taskService.getCommentsForTask(taskId).subscribe({
            next: (comments: Comment[]) => {
                this.comments = comments;
            },
            error: (error: any) => {
                console.error('Error loading comments:', error);
                this.snackBar.open('Failed to load comments', 'Close', { duration: 3000 });
            }
        });
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
                    this.submitting = false;
                    this.task = updatedTask;
                    this.taskUpdated.emit(updatedTask);
                    this.snackBar.open('Task updated successfully', 'Close', { duration: 3000 });
                },
                error: (error) => {
                    this.error = 'Failed to update task. Please try again later.';
                    this.submitting = false;
                    console.error('Error updating task:', error);
                    this.snackBar.open('Failed to update task', 'Close', { duration: 3000 });
                }
            });
        } else {
            this.taskService.createTask(taskData).subscribe({
                next: (newTask) => {
                    this.submitting = false;
                    this.task = newTask;
                    this.taskUpdated.emit(newTask);
                    this.snackBar.open('Task created successfully', 'Close', { duration: 3000 });
                    this.close();
                },
                error: (error) => {
                    this.error = 'Failed to create task. Please try again later.';
                    this.submitting = false;
                    console.error('Error creating task:', error);
                    this.snackBar.open('Failed to create task', 'Close', { duration: 3000 });
                }
            });
        }
    }

    prepareTaskData(): Task {
        const formValues = this.taskForm.value;

        return {
            ...(this.task && this.task.taskId ? { taskId: this.task.taskId } : {}),
            title: formValues.title,
            description: formValues.description,
            comments: formValues.comments,
            priority: formValues.priority,
            status: formValues.status,
            phase: this.task?.phase,
            attachments: this.task?.attachments,
            xpPoint: formValues.xpPoint,
            startDate: formValues.startDate,
            endDate: formValues.endDate,
            assigneeId: this.assignees.length > 0 ? this.assignees[0].id : undefined
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

        if (confirm('Are you sure you want to delete this task?')) {
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
                    console.error('Error deleting task:', error);
                }
            });
        }
    }

    close() {
        this.closeEvent.emit(false);
    }

    // Title editing methods
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

    // Description editing methods
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

    // Assignee methods
    openAssigneeDropdown(): void {
        this.showAssigneeDropdown = !this.showAssigneeDropdown;
    }

    addAssignee(assignee: Assignee): void {
        if (!this.assignees.some((a) => a.id === assignee.id)) {
            this.assignees.push(assignee);
            this.showAssigneeDropdown = false;

            if (this.task) {
                this.task.assigneeId = assignee.id;
                this.onSubmit();
            }
        }
    }

    removeAssignee(assigneeId: number): void {
        this.assignees = this.assignees.filter((a) => a.id !== assigneeId);

        if (this.task) {
            this.task.assigneeId = this.assignees.length > 0 ? this.assignees[0].id : undefined;
            this.onSubmit();
        }
    }

    saveStartDate(): void {
        if (this.task) {
            this.task.startDate = this.taskForm.value.startDate;
            this.onSubmit();
        }
    }

    cancelEditStartDate(): void {
        if (this.task) {
            this.taskForm.patchValue({ startDate: this.task.startDate });
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
            this.taskForm.patchValue({ endDate: this.task.endDate });
        }
    }

    // Add a comment
    addComment(): void {
        const commentValue = this.taskForm.value.comment;
        if (!commentValue?.trim()) {
            return;
        }

        const newComment: Comment = {
            id: Date.now(),
            authorName: 'Current User', // Replace with actual user name
            authorAvatar: 'assets/default-avatar.png', // Replace with actual user avatar
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
        console.log('downloadAttachment called with attachment:', attachment);
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
                console.error('Error downloading attachment:', err);
                this.snackBar.open('Failed to download attachment.', 'Close', { duration: 3000 });
            }
        });
    }

    deleteAttachment(attachment: Attachment) {
        if (!this.task || !this.task.taskId) return;

        // Confirm deletion
        if (!confirm(`Are you sure you want to delete ${attachment.name}?`)) return;

        // Remove attachment from the task's attachments array
        this.task.attachments = this.task.attachments?.filter((att) => att.name !== attachment.name) || [];

        // Update the task via the service
        this.loading = true;
        this.taskService.updateTask(this.task.taskId, this.task).subscribe({
            next: (updatedTask) => {
                this.task = updatedTask;
                this.loading = false;
                this.taskUpdated.emit(updatedTask); // Emit the updated task
                this.snackBar.open('Attachment deleted successfully.', 'Close', { duration: 2000 });
            },
            error: (err) => {
                console.error('Error deleting attachment:', err);
                this.loading = false;
                this.snackBar.open('Failed to delete attachment.', 'Close', { duration: 3000 });
                // Revert on error by reloading the task
                this.taskService.getTaskById(this.task!.taskId!).subscribe((task) => {
                    this.task = task;
                    this.patchForm(task);
                });
            }
        });
    }
}
