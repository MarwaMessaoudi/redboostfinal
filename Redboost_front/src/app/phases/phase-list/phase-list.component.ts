import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PhaseService } from '../../services/phase.service';
import { TaskService } from '../../services/task.service';
import { Phase, PhaseStatus } from '../../models/phase';
import { Task, Status } from '../../models/task';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PhaseFormComponent } from '../phase-form/phase-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-phase-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, MatTableModule, MatIconModule, MatButtonModule, DatePipe, MatDialogModule],
    templateUrl: './phase-list.component.html',
    styleUrls: ['./phase-list.component.scss'],
    providers: [DatePipe]
})
export class PhaseListComponent implements OnInit {
    phases: Phase[] = [];
    loading = true;
    error = '';
    PhaseStatus = PhaseStatus;
    inProgressCount: number = 0;
    upcomingCount: number = 0;
    currentDate: Date = new Date();
    phaseTasks: { [phaseId: number]: Task[] } = {};

    constructor(
        private phaseService: PhaseService,
        private taskService: TaskService,
        public dialog: MatDialog,
        private snackBar: MatSnackBar,
        private datePipe: DatePipe,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadPhases();
    }

    loadPhases(): void {
        this.loading = true;
        this.phaseService.getAllPhases().subscribe({
            next: (data) => {
                // Sort the phases array by the createdAt property in ascending order (oldest first)
                this.phases = data.sort((a, b) => {
                    return new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime();
                });

                this.loading = false;
                this.calculateMetrics();
                this.loadTasksForPhases();
            },
            error: (err) => {
                this.error = 'Impossible de charger les phases. Veuillez réessayer plus tard.';
                this.loading = false;
                console.error('Erreur lors du chargement des phases :', err);
            }
        });
    }

    loadTasksForPhases(): void {
        this.phases.forEach((phase) => {
            this.taskService.getTasksByPhaseId(phase.phaseId!).subscribe({
                next: (tasks) => {
                    this.phaseTasks[phase.phaseId!] = tasks;
                },
                error: (err) => {
                    console.error(`Impossible de charger les tâches pour la phase ${phase.phaseId} :`, err);
                }
            });
        });
    }

    calculateMetrics(): void {
        this.inProgressCount = this.phases.filter((phase) => phase.status === PhaseStatus.IN_PROGRESS).length;
        this.upcomingCount = this.phases.filter((phase) => phase.status === PhaseStatus.NOT_STARTED).length;
    }

    // New method to get phases by status
    getPhasesByStatus(status: PhaseStatus): Phase[] {
        return this.phases.filter((phase) => phase.status === status);
    }

    deletePhase(id: number): void {
        //if (confirm('Êtes-vous sûr de vouloir supprimer cette phase ?')) {   //REMOVE THIS LINE
        this.phaseService.deletePhase(id).subscribe({
            next: () => {
                this.phases = this.phases.filter((phase) => phase.phaseId !== id);
                this.snackBar.open('Phase supprimée avec succès', 'Fermer', {
                    //UNCOMMENT THIS LINE
                    duration: 3000
                }); //UNCOMMENT THIS LINE
                this.loadPhases();
            },
            error: (err) => {
                this.error = 'Impossible de supprimer la phase. Veuillez réessayer plus tard.';
                console.error('Erreur lors de la suppression de la phase :', err);
                this.snackBar.open('Impossible de supprimer la phase', 'Fermer', {
                    //UNCOMMENT THIS LINE
                    duration: 3000
                }); //UNCOMMENT THIS LINE
            }
        });
        //}  //REMOVE THIS LINE
    }

    openEditDialog(phase: Phase): void {
        const dialogRef = this.dialog.open(PhaseFormComponent, {
            maxWidth: 'none',
            data: { phase: { ...phase }, isEdit: true }
        });

        dialogRef.afterClosed().subscribe({
            next: (result) => {
                if (result) {
                    this.loadPhases();
                    this.snackBar.open('Phase mise à jour avec succès', 'Fermer', {
                        //UNCOMMENT THIS LINE
                        duration: 3000 //UNCOMMENT THIS LINE
                    }); //UNCOMMENT THIS LINE
                }
            },
            error: (err) => {
                console.error('Error updating the phase: ', err);
            }
        });
    }

    openCreateDialog(): void {
        const dialogRef = this.dialog.open(PhaseFormComponent, {
            maxWidth: 'none',
            data: { isEdit: false }
        });

        dialogRef.afterClosed().subscribe({
            next: (result) => {
                if (result) {
                    this.loadPhases();
                    this.snackBar.open('Phase crée avec succès', 'Fermer', {
                        //UNCOMMENT THIS LINE
                        duration: 3000 //UNCOMMENT THIS LINE
                    }); //UNCOMMENT THIS LINE
                }
            },
            error: (err) => {
                console.error('Error creating the phase: ', err);
            }
        });
    }

    calculateDoneXP(phaseId: number): number {
        const tasks = this.phaseTasks[phaseId];

        if (!tasks) {
            return 0;
        }

        let totalDoneXP = 0;
        tasks.forEach((task) => {
            if (task.status === Status.DONE) {
                totalDoneXP += task.xpPoint || 0;
            }
        });
        return totalDoneXP;
    }

    calculateXPProgress(phaseId: number): number {
        const tasks = this.phaseTasks[phaseId];

        if (!tasks) {
            return 0;
        }

        let totalXP = 0;
        let totalDoneXP = 0;

        tasks.forEach((task) => {
            totalXP += task.xpPoint || 0;
            if (task.status === Status.DONE) {
                totalDoneXP += task.xpPoint || 0;
            }
        });

        if (totalXP === 0) {
            return 0;
        }

        return Math.round((totalDoneXP / totalXP) * 100);
    }

    getDaysLeft(endDate: string): number {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    }

    openDescriptionDialog(phase: Phase): void {
        this.dialog.open(PhaseDescriptionDialogComponent, {
            width: '800px',
            panelClass: 'styled-dialog',
            data: {
                phaseName: phase.phaseName,
                description: phase.description,
                deadline: this.datePipe.transform(phase.endDate, 'MMMM d, y')
            }
        });
    }

    goToKanbanBoard(phaseId: number): void {
        this.router.navigate(['/phases', phaseId]);
    }
}

@Component({
    selector: 'phase-description-dialog',
    template: `
        <div class="content-card">
            <h2>{{ data.phaseName }}</h2>
            <p class="description">{{ data.description }}</p>
            <div class="deadline-info">
                <span class="deadline-label">Date limite :</span>
                <span class="deadline-value">{{ data.deadline }}</span>
            </div>
            <div class="dialog-actions">
                <button mat-button mat-dialog-close class="close-button">Fermer</button>
            </div>
        </div>
    `,
    styles: [
        `
            .phase-tracking-container {
                padding: 20px;
                font-family: 'Roboto', sans-serif;
            }

            .phase-headers {
                display: flex;
                justify-content: space-between;
                margin-bottom: 24px;
            }

            .phase-header {
                flex: 1;
                text-align: center;
                padding: 12px;
                border-radius: 8px;
                position: relative;
                margin: 0 6px;
                cursor: pointer;
                color: #fff;
            }

            .phase-header.sourced {
                background-color: #ffa500; /* Orange */
            }

            .phase-header.in-progress {
                background-color: #4b89dc; /* Blue */
            }

            .phase-header.interview {
                background-color: #9c5dc0; /* Purple */
            }

            .phase-title {
                font-weight: bold;
                font-size: 14px;
            }

            .phase-badge {
                position: absolute;
                top: -10px;
                right: -10px;
                background-color: white;
                color: #333;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }

            .content-container {
                margin-bottom: 20px;
            }

            .content-card {
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                padding: 20px;
                border: 1px solid #e0e0e0;
            }

            .content-card h2 {
                margin-top: 0;
                margin-bottom: 16px;
                font-size: 18px;
                color: #333;
            }

            .description {
                margin-bottom: 20px;
                line-height: 1.6;
                color: #555;
            }

            .deadline-info {
                display: flex;
                align-items: center;
                padding-top: 12px;
                border-top: 1px solid #eee;
            }

            .deadline-label {
                font-weight: 500;
                margin-right: 8px;
                color: #666;
            }

            .deadline-value {
                color: #333;
                font-weight: 500;
            }

            .dialog-actions {
                display: flex;
                justify-content: flex-end;
            }

            .close-button {
                background-color: #f0f0f0;
                color: #333;
                padding: 8px 16px;
                border-radius: 4px;
            }
        `
    ],
    standalone: true,
    imports: [MatButtonModule, MatDialogModule, CommonModule]
})
export class PhaseDescriptionDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: { phaseName: string; description: string; deadline: string }
    ) {}
}
