import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { trigger, state, style, transition, animate, stagger, query } from '@angular/animations';

@Component({
    standalone: true,
    selector: 'app-best-selling-widget',
    imports: [CommonModule, ButtonModule, MenuModule],
    template: `
    <div class="card p-6 bg-[#F9FAFB] rounded-2xl shadow-sm font-inter" [@cardAnimation]>
        <!-- Header Section -->
        <div class="flex justify-between items-center mb-8">
            <div>
                <div class="font-bold text-3xl text-[#DB1E37]">Suivi des Tâches</div>
                <div class="text-[#6B7280] text-base">Suivez l'avancement de vos tâches en temps réel</div>
            </div>
            <div>
                <button pButton type="button" icon="pi pi-ellipsis-v" class="p-button-rounded p-button-text p-button-plain hover:bg-[#0A4955] hover:text-white transition-all duration-300 transform hover:scale-110"></button>
                <p-menu #menu [popup]="true" [model]="items"></p-menu>
            </div>
        </div>

        <!-- Task List Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" @listAnimation>
            <div *ngFor="let task of tasks; let i = index" class="p-6 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#0A4955] transition-all duration-300 ease-in-out cursor-pointer transform hover:-translate-y-1 hover:shadow-lg" [@itemAnimation]="getAnimationState(i)">
                <div class="flex flex-col h-full">
                    <div class="flex-1">
                        <span class="text-[#0A4955] font-semibold text-xl">{{ task.name }}</span>
                        <div class="mt-2 text-[#6B7280] text-sm">{{ task.description }}</div>
                    </div>
                    <div class="mt-4">
                        <div class="bg-[#E5E7EB] rounded-full overflow-hidden w-full" style="height: 8px">
                            <div class="h-full transition-all duration-500 ease-in-out" [ngStyle]="{ 'width': animatedProgress[i] + '%', 'background': task.gradient }"></div>
                        </div>
                        <div class="mt-3 flex justify-between items-center">
                            <span class="text-[#0A4955] font-bold text-lg">{{ animatedProgress[i] || '0' }}%</span>
                            <span class="text-[#6B7280] text-sm">{{ task.status }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Statistics Section -->
        <div class="mt-12">
            <div class="text-[#DB1E37] font-bold text-2xl mb-6">Statistiques des Tâches</div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" @listAnimation>
                <div class="p-6 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#0A4955] transition-all duration-300 ease-in-out cursor-pointer transform hover:-translate-y-1 hover:shadow-lg">
                    <div class="flex items-center gap-3">
                        <i class="pi pi-check-circle text-[#DB1E37] text-2xl"></i>
                        <div class="text-[#0A4955] font-bold text-lg">Tâches Terminées</div>
                    </div>
                    <div class="text-[#0A4955] text-3xl mt-3 font-bold" [@countAnimation]="completedTasks">
                        {{ completedTasks.toFixed(2) }}
                    </div>
                </div>
                <div class="p-6 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#0A4955] transition-all duration-300 ease-in-out cursor-pointer transform hover:-translate-y-1 hover:shadow-lg">
                    <div class="flex items-center gap-3">
                        <i class="pi pi-clock text-[#DB1E37] text-2xl"></i>
                        <div class="text-[#0A4955] font-bold text-lg">Tâches en Attente</div>
                    </div>
                    <div class="text-[#0A4955] text-3xl mt-3 font-bold" [@countAnimation]="pendingTasks">
                        {{ pendingTasks.toFixed(2) }}
                    </div>
                </div>
                <div class="p-6 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#0A4955] transition-all duration-300 ease-in-out cursor-pointer transform hover:-translate-y-1 hover:shadow-lg">
                    <div class="flex items-center gap-3">
                        <i class="pi pi-chart-line text-[#DB1E37] text-2xl"></i>
                        <div class="text-[#0A4955] font-bold text-lg">Progrès Moyen</div>
                    </div>
                    <div class="text-[#0A4955] text-3xl mt-3 font-bold" [@countAnimation]="averageProgress">
                        {{ averageProgress.toFixed(2) }}%
                    </div>
                </div>
                <div class="p-6 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#0A4955] transition-all duration-300 ease-in-out cursor-pointer transform hover:-translate-y-1 hover:shadow-lg">
                    <div class="flex items-center gap-3">
                        <i class="pi pi-exclamation-triangle text-[#DB1E37] text-2xl"></i>
                        <div class="text-[#0A4955] font-bold text-lg">Tâches en Retard</div>
                    </div>
                    <div class="text-[#0A4955] text-3xl mt-3 font-bold" [@countAnimation]="overdueTasks">
                        {{ overdueTasks.toFixed(2) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    animations: [
        trigger('cardAnimation', [
            state('void', style({ opacity: 0, transform: 'scale(0.95) translateY(10px)' })),
            transition(':enter', [
                animate('0.5s cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
            ])
        ]),
        trigger('listAnimation', [
            transition('* => *', [
                query(':enter', [
                    style({ opacity: 0, transform: 'translateY(10px)' }),
                    stagger(100, [
                        animate('0.4s cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
                    ])
                ], { optional: true })
            ])
        ]),
        trigger('itemAnimation', [
            state('void', style({ opacity: 0, transform: 'translateX(-20px)' })),
            transition(':enter', [
                animate('0.4s {{delay}}ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
            ], { params: { delay: 0 } })
        ]),
        trigger('countAnimation', [
            transition(':increment', [
                animate('0.3s', style({ transform: 'scale(1.1)' })),
                animate('0.3s', style({ transform: 'scale(1)' }))
            ])
        ])
    ]
})
export class BestSellingWidget {
    menu = null;

    items = [
        { label: 'Ajouter une Tâche', icon: 'pi pi-fw pi-plus' },
        { label: 'Supprimer', icon: 'pi pi-fw pi-trash' }
    ];

    tasks = [
        { name: 'Respect des Délais', description: 'Tâches terminées à temps', progress: 85, color: '#0A4955', gradient: 'linear-gradient(90deg, #0A4955, #1C7C7C)', status: 'En Bonne Voie' },
        { name: 'Progrès Global', description: 'Tâches terminées', progress: 72, color: '#0A4955', gradient: 'linear-gradient(90deg, #0A4955, #1C7C7C)', status: 'Attention Requise' },
        { name: 'Efficacité des Tâches', description: 'Tâches terminées efficacement', progress: 90, color: '#0A4955', gradient: 'linear-gradient(90deg, #0A4955, #1C7C7C)', status: 'En Bonne Voie' }
    ];

    animatedProgress: number[] = []; // Stores the animated progress values
    completedTasks = 0;
    pendingTasks = 0;
    averageProgress = 0;
    overdueTasks = 0;

    ngOnInit() {
        this.animateProgress();
        this.animateStatistics();
    }

    // Function to animate progress bars
    animateProgress() {
        this.tasks.forEach((task, index) => {
            const targetProgress = task.progress; // Target progress (0-100)
            const duration = 2000; // Animation duration in milliseconds
            const increment = targetProgress / (duration / 16); // Increment for the progress

            let currentProgress = 0;

            const updateAnimation = () => {
                currentProgress += increment;
                if (currentProgress >= targetProgress) {
                    currentProgress = targetProgress;
                }

                this.animatedProgress[index] = Math.round(currentProgress);

                if (currentProgress < targetProgress) {
                    requestAnimationFrame(updateAnimation);
                }
            };

            requestAnimationFrame(updateAnimation);
        });
    }

    // Function to animate statistics
    animateStatistics() {
        const duration = 2000; // Animation duration in milliseconds
        const incrementCompleted = this.getCompletedTasks() / (duration / 16);
        const incrementPending = this.getPendingTasks() / (duration / 16);
        const incrementAverage = this.getAverageProgress() / (duration / 16);
        const incrementOverdue = this.getOverdueTasks() / (duration / 16);

        const updateStatistics = () => {
            if (this.completedTasks < this.getCompletedTasks()) {
                this.completedTasks += incrementCompleted;
                if (this.completedTasks > this.getCompletedTasks()) this.completedTasks = this.getCompletedTasks();
            }

            if (this.pendingTasks < this.getPendingTasks()) {
                this.pendingTasks += incrementPending;
                if (this.pendingTasks > this.getPendingTasks()) this.pendingTasks = this.getPendingTasks();
            }

            if (this.averageProgress < this.getAverageProgress()) {
                this.averageProgress += incrementAverage;
                if (this.averageProgress > this.getAverageProgress()) this.averageProgress = this.getAverageProgress();
            }

            if (this.overdueTasks < this.getOverdueTasks()) {
                this.overdueTasks += incrementOverdue;
                if (this.overdueTasks > this.getOverdueTasks()) this.overdueTasks = this.getOverdueTasks();
            }

            if (
                this.completedTasks < this.getCompletedTasks() ||
                this.pendingTasks < this.getPendingTasks() ||
                this.averageProgress < this.getAverageProgress() ||
                this.overdueTasks < this.getOverdueTasks()
            ) {
                requestAnimationFrame(updateStatistics);
            }
        };

        requestAnimationFrame(updateStatistics);
    }

    getAnimationState(index: number) {
        return { value: true, params: { delay: index * 100 } };
    }

    getCompletedTasks() {
        return this.tasks.filter(task => task.progress === 100).length;
    }

    getPendingTasks() {
        return this.tasks.filter(task => task.progress < 100).length;
    }

    getAverageProgress() {
        const total = this.tasks.reduce((sum, task) => sum + task.progress, 0);
        return total / this.tasks.length;
    }

    getOverdueTasks() {
        return this.tasks.filter(task => task.progress < 50).length;
    }
}