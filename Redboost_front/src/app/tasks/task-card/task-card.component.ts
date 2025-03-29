import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Task, Priority, TaskCategory } from '../../models/task';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { TaskCategoryService } from '../../services/taskCategory.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-task-card',
    standalone: true,
    imports: [CommonModule, MatIconModule, CdkDrag],
    templateUrl: './task-card.component.html',
    styleUrls: ['./task-card.component.scss']
})
export class TaskCardComponent implements OnInit, OnDestroy {
    @Input() task!: Task;
    @Input() phaseName: string = 'Unknown Phase';
    @Input() openEditTaskDialog!: (task: Task) => void;
    @Input() assigneeAvatarUrl: string | null = null;
    @Input() assigneeInitials: string | null = null; // New input for initials
    TaskPriority = Priority;
    availableCategories: TaskCategory[] = [];
    private categorySubscription?: Subscription;
    categoryName: string = 'Aucune catégorie';

    constructor(private taskCategoryService: TaskCategoryService) {}

    ngOnInit(): void {
        this.loadAvailableCategories();
        console.log(`Task ${this.task.taskId} Phase:`, this.task.phase);
        console.log('Avatar URL:', this.assigneeAvatarUrl);
        console.log('Initials:', this.assigneeInitials);
    }

    ngOnDestroy(): void {
        this.categorySubscription?.unsubscribe();
    }

    loadAvailableCategories(): void {
        this.categorySubscription = this.taskCategoryService.getAllTaskCategories().subscribe({
            next: (categories) => {
                this.availableCategories = categories;
                this.categoryName = this.getCategoryName(this.task.taskCategoryId);
            },
            error: (err) => {
                console.error('Error fetching categories in TaskCard:', err);
                this.categoryName = 'Catégorie inconnue';
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

    getPriorityClass(priority: Priority): string {
        return priority ? 'priority-' + priority.toLowerCase() : '';
    }
}
