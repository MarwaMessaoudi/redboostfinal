import { Component, Input } from '@angular/core';
import { Task, Priority } from '../../models/task';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CdkDrag } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-task-card',
    standalone: true,
    imports: [CommonModule, MatIconModule, CdkDrag],
    templateUrl: './task-card.component.html',
    styleUrls: ['./task-card.component.scss'] // Create this file
})
export class TaskCardComponent {
    @Input() task!: Task;
    @Input() openEditTaskDialog!: (task: Task) => void; // Fonction pour ouvrir la boîte de dialogue de modification
    TaskPriority = Priority;

    getPriorityClass(priority: Priority): string {
        return 'priority-' + priority.toLowerCase();
    }
}
