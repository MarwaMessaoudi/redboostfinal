import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService } from '../services/task.service';
import { Task, Status, Priority } from '../models/task';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDropList } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TaskFormComponent } from '../tasks/task-form/task-form.component';
import { TaskUpdateComponent } from '../tasks/task-update/task-update.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { Subject, debounceTime } from 'rxjs';
import { TaskCardComponent } from '../tasks/task-card/task-card.component';

@Component({
    selector: 'app-kanban-board',
    standalone: true,
    imports: [CommonModule, RouterModule, CdkDropList, MatButtonModule, MatCardModule, MatIconModule, MatMenuModule, MatTooltipModule, FormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, TaskCardComponent, TaskUpdateComponent],
    templateUrl: './kanban-board.component.html',
    styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit {
    phaseId: number | null = null;
    tasks: Task[] = [];
    filteredTasks: Task[] = [];
    todo: Task[] = [];
    inprogress: Task[] = [];
    completed: Task[] = [];
    statusFilter: Status | 'ALL' = 'ALL';
    priorityFilter: Priority | 'ALL' = 'ALL';
    searchTerm: string = '';
    selectedTask: Task | null = null;
    isPanelOpen: boolean = false;

    TaskStatus = Status;
    TaskPriority = Priority;

    private searchTermSubject = new Subject<string>();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private taskService: TaskService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            this.phaseId = params.get('phaseId') ? +params.get('phaseId')! : null;
            if (this.phaseId) {
                this.loadTasksForPhase(this.phaseId);
            } else {
                console.error('Phase ID is null!');
                this.snackBar.open("Erreur : L'ID de phase est nul !", 'Fermer', { duration: 3000 });
            }
        });

        this.searchTermSubject.pipe(debounceTime(300)).subscribe(() => {
            this.applyFilters();
        });
    }

    loadTasksForPhase(phaseId: number): void {
        this.taskService.getTasksByPhaseId(phaseId).subscribe({
            next: (tasks) => {
                this.tasks = tasks;
                this.applyFilters();
            },
            error: (err) => {
                console.error('Échec du chargement des tâches :', err);
                this.snackBar.open('Erreur : Échec du chargement des tâches. Veuillez réessayer.', 'Fermer', { duration: 3000 });
            }
        });
    }

    sortTasksIntoColumns(): void {
        this.todo = this.filteredTasks.filter((task) => task.status === Status.TO_DO);
        this.inprogress = this.filteredTasks.filter((task) => task.status === Status.IN_PROGRESS);
        this.completed = this.filteredTasks.filter((task) => task.status === Status.DONE);
    }

    drop(event: CdkDragDrop<Task[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

            const task = event.container.data[event.currentIndex];
            if (task) {
                let newStatus: Status;
                if (event.container.id === 'todo') {
                    newStatus = Status.TO_DO;
                } else if (event.container.id === 'inprogress') {
                    newStatus = Status.IN_PROGRESS;
                } else {
                    newStatus = Status.DONE;
                }
                task.status = newStatus;
                this.updateTaskStatus(task);
            }
        }
    }

    updateTaskStatus(task: Task) {
        // Optimistic update
        const originalStatus = task.status; // Store original status
        task.status = task.status; // optimistically update
        this.taskService.updateTask(task.taskId!, task).subscribe({
            next: () => {
                console.log(`Task ${task.taskId} status updated to ${task.status}`);
                //this.snackBar.open(`Task status updated to ${task.status}`, 'Close', { duration: 2000 });  // COMMENT OUT THIS LINE!
            },
            error: (err) => {
                console.error(`Échec de la mise à jour de la tâche ${task.taskId} :`, err);
                this.snackBar.open('Erreur : Échec de la mise à jour de la tâche. Veuillez réessayer.', 'Fermer', { duration: 3000 });
                task.status = originalStatus; // Revert to original status on error
                this.loadTasksForPhase(this.phaseId!); // Refresh the data
            }
        });
    }

    openCreateTaskDialog(): void {
        const dialogRef = this.dialog.open(TaskFormComponent, {
            width: '60vw', // Make the dialog 90% of the viewport width
            maxWidth: 'none', // Allow it to expand if needed
            data: { phaseId: this.phaseId, task: null, isEdit: false } // Pass phaseId to pre-select
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadTasksForPhase(this.phaseId!); // Reload tasks if a new task was created
            }
        });
    }

    // You can also adjust the width of the edit dialog here if you want it different
    openEditTaskDialog(task: Task): void {
        this.selectedTask = task;
        this.isPanelOpen = true;
    }

    closePanel(): void {
        this.isPanelOpen = false;
        this.selectedTask = null;
        this.loadTasksForPhase(this.phaseId!);
    }

    applyFilters(): void {
        let result = [...this.tasks];

        if (this.statusFilter !== 'ALL') {
            result = result.filter((task) => task.status === this.statusFilter);
        }

        if (this.priorityFilter !== 'ALL') {
            result = result.filter((task) => task.priority === this.priorityFilter);
        }

        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase().trim();
            result = result.filter((task) => task.title.toLowerCase().includes(term) || (task.description && task.description.toLowerCase().includes(term)));
        }

        this.filteredTasks = result;
        this.sortTasksIntoColumns();
    }

    getStatusClass(status: Status): string {
        switch (status) {
            case Status.TO_DO:
                return 'status-todo';
            case Status.IN_PROGRESS:
                return 'status-in-progress';
            case Status.DONE:
                return 'status-done';
            default:
                return '';
        }
    }

    getPriorityClass(priority: Priority): string {
        return 'priority-' + priority.toLowerCase();
    }

    resetFilters(): void {
        this.statusFilter = 'ALL';
        this.priorityFilter = 'ALL';
        this.searchTerm = '';
        this.applyFilters();
    }

    onSearchTermChange(term: string): void {
        this.searchTermSubject.next(term);
    }
}
