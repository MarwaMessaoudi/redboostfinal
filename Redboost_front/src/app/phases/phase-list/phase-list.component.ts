import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // Import Router
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
import { Inject } from '@angular/core';

@Component({
    selector: 'app-phase-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, MatTableModule, MatIconModule, MatButtonModule, DatePipe, MatIconModule, MatDialogModule],
    templateUrl: './phase-list.component.html',
    styleUrls: ['./phase-list.component.scss'],
    providers: [DatePipe]
})
export class PhaseListComponent implements OnInit {
    phases: Phase[] = [];
    loading = true;
    error = '';
    displayedColumns: string[] = ['phaseName', 'startDate', 'endDate', 'status', 'actions'];
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
        private router: Router // Inject Router
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
                console.error('Erreur lors du chargement des phases :', err);
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
                    console.error(`Impossible de charger les tâches pour la phase ${phase.phaseId} :`, err);
                }
            });
        });
    }

    calculateMetrics(): void {
        this.inProgressCount = this.phases.filter((phase) => phase.status === PhaseStatus.IN_PROGRESS).length;
        this.upcomingCount = this.phases.filter((phase) => phase.status === PhaseStatus.NOT_STARTED).length;
    }

    deletePhase(id: number): void {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette phase ?')) {
            this.phaseService.deletePhase(id).subscribe({
                next: () => {
                    this.phases = this.phases.filter((phase) => phase.phaseId !== id);
                    this.snackBar.open('Phase supprimée avec succès', 'Fermer', {
                        duration: 3000
                    });
                    this.loadPhases();
                },
                error: (err) => {
                    this.error = 'Impossible de supprimer la phase. Veuillez réessayer plus tard.';
                    console.error('Erreur lors de la suppression de la phase :', err);
                    this.snackBar.open('Impossible de supprimer la phase', 'Fermer', {
                        duration: 3000
                    });
                }
            });
        }
    }

    openEditDialog(phase: Phase): void {
        const dialogRef = this.dialog.open(PhaseFormComponent, {
            width: '60vw', // Make the dialog 90% of the viewport width
            maxWidth: 'none', // Allow it to expand if needed
            data: { phase: { ...phase }, isEdit: true }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadPhases();
                this.snackBar.open('Phase mise à jour avec succès', 'Fermer', {
                    duration: 3000
                });
            }
        });
    }

    openCreateDialog(): void {
        const dialogRef = this.dialog.open(PhaseFormComponent, {
            width: '60vw', // Make the dialog 90% of the viewport width
            maxWidth: 'none', // Allow it to expand if needed
            data: { isEdit: false }
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadPhases();
                this.snackBar.open('Phase créée avec succès', 'Fermer', {
                    duration: 3000
                });
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

    getStatusClass(status: PhaseStatus): string {
        return 'status-' + status.toLowerCase().replace('_', '-');
    }

    openDescriptionDialog(phase: Phase): void {
        this.dialog.open(PhaseDescriptionDialogComponent, {
            width: '400px',
            data: {
                phaseName: phase.phaseName,
                description: phase.description,
                deadline: this.datePipe.transform(phase.endDate, 'MMMM d, y')
            }
        });
    }
    goToTimeline(phaseId: number): void {
        this.router.navigate(['/phases/timeline', phaseId]);
    }

    goToKanbanBoard(phaseId: number): void {
        this.router.navigate(['/phases', phaseId]);
    }
}

@Component({
    selector: 'phase-description-dialog',
    template: `
        <h1 mat-dialog-title>{{ data.phaseName }}</h1>
        <div mat-dialog-content>
            <p>{{ data.description }}</p>
            <p>Date limite : {{ data.deadline }}</p>
        </div>
        <div mat-dialog-actions>
            <button mat-button mat-dialog-close>Fermer</button>
        </div>
    `,
    standalone: true,
    imports: [MatButtonModule, MatDialogModule]
})
export class PhaseDescriptionDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: { phaseName: string; description: string; deadline: string }
    ) {}
}
