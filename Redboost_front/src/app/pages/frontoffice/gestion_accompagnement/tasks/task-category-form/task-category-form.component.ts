import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TaskCategoryService } from '../../../service/taskCategory.service';
import { TaskCategory } from '../../../../../models/task';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar'; // Added for error feedback

@Component({
    selector: 'app-task-category-form',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
    template: `
        <h2 mat-dialog-title>Créer une nouvelle catégorie</h2>
        <mat-dialog-content>
            <mat-form-field appearance="fill">
                <mat-label>Nom de la catégorie</mat-label>
                <input matInput [(ngModel)]="category.name" required />
            </mat-form-field>
        </mat-dialog-content>
        <mat-dialog-actions>
            <button mat-button (click)="onCancel()">Annuler</button>
            <button mat-button color="primary" (click)="onSave()" [disabled]="!category.name">Sauvegarder</button>
        </mat-dialog-actions>
    `,
    styles: [] // Add styles if needed
})
export class TaskCategoryFormComponent {
    category: TaskCategory = { name: '' }; // Simplified initial state, no id

    constructor(
        public dialogRef: MatDialogRef<TaskCategoryFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private taskCategoryService: TaskCategoryService,
        private snackBar: MatSnackBar // Added for error feedback
    ) {}

    onCancel(): void {
        this.dialogRef.close();
    }

    onSave(): void {
        const categoryToSave = { name: this.category.name }; // Only send name
        this.taskCategoryService.createTaskCategory(categoryToSave).subscribe({
            next: (result) => {
                this.dialogRef.close(result);
                this.snackBar.open('Catégorie créée avec succès', 'Fermer', { duration: 3000 });
            },
            error: (err) => {
                console.error('Failed to create category:', err);
                const errorMessage = err.error?.message || 'Erreur lors de la création de la catégorie';
                this.snackBar.open(errorMessage, 'Fermer', { duration: 3000 });
                this.dialogRef.close();
            }
        });
    }
}
