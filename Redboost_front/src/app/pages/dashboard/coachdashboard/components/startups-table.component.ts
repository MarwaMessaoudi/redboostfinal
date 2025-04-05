import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { animate, style, transition, trigger } from '@angular/animations';

export interface StartupTask {
  name: string;
  deadline: Date;
}

export interface Startup {
  name: string;
  satisfaction: number;
  progress: number;
  score: number;
  status: string;
  tasks: StartupTask[];
}

@Component({
  standalone: true,
  selector: 'app-startups-table',
  imports: [
    CommonModule,
    TableModule,
    ProgressBarModule,
    TooltipModule,
    SkeletonModule
  ],
  template: `
    <div class="table-container">
      <h2 class="table-title">Startups Guidées</h2>
      <p-table 
        [value]="startups" 
        [paginator]="true" 
        [rows]="5" 
        [rowsPerPageOptions]="[5, 10, 20]"
        [loading]="loading"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Startup</th>
            <th>Taux de Satisfaction</th>
            <th>Progrès</th>
            <th>Score</th>
            <th>Statut</th>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="loadingbody" let-columns="columns">
          <tr *ngFor="let row of [0,1,2,3,4]">
            <td *ngFor="let col of columns">
              <p-skeleton></p-skeleton>
            </td>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="body" let-startup>
          <tr [@fadeIn] class="hover-row" (click)="toggleExpand(startup.name)">
            <td>{{ startup.name }}</td>
            <td>
              <div class="progress-bar">
                <div class="progress-fill" 
                     [ngStyle]="{ width: getAnimatedValue(startup.name, 'satisfaction') + '%', 'background-color': '#DB1E37' }">
                </div>
              </div>
              <span class="satisfaction-text">{{ getAnimatedValue(startup.name, 'satisfaction') || '0' }}%</span>
            </td>
            <td>
              <div class="progress-bar">
                <div class="progress-fill" 
                     [ngStyle]="{ width: getAnimatedValue(startup.name, 'progress') + '%', 'background-color': '#DB1E37' }">
                </div>
              </div>
              <span class="progress-text">{{ getAnimatedValue(startup.name, 'progress') || '0' }}%</span>
            </td>
            <td>
              <span class="score-text">{{ getAnimatedValue(startup.name, 'score') || '0' }}</span>
            </td>
            <td>
              <span class="status-badge" 
                    [ngClass]="getStatusClass(startup.status)" 
                    [pTooltip]="startup.status" 
                    tooltipPosition="top">
                {{ startup.status }}
              </span>
            </td>
          </tr>
          
          <tr *ngIf="expandedRow === startup.name" [@expand]>
            <td colspan="5">
              <div class="task-container">
                <h3 class="task-title">Prochaines Tâches</h3>
                <ul class="task-list">
                  <li *ngFor="let task of startup.tasks" class="task-item">
                    <span class="task-name">{{ task.name }}</span>
                    <span class="task-deadline">{{ task.deadline | date:'dd/MM/yyyy' }}</span>
                  </li>
                </ul>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [`
    .table-container {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .table-title {
      color: #0a4955;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
    }
    
    .progress-bar {
      width: 100%;
      height: 0.5rem;
      background: #e5e7eb;
      border-radius: 0.25rem;
      overflow: hidden;
      position: relative;
    }
    
    .progress-fill {
      height: 100%;
      border-radius: 0.25rem;
      transition: width 0.5s ease;
    }
    
    .satisfaction-text, .progress-text, .score-text {
      display: block;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #4b5563;
    }
    
    .hover-row:hover {
      background-color: #f9fafb;
      cursor: pointer;
    }
    
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .en-bonne-voie {
      background-color: #d1fae5;
      color: #065f46;
    }
    
    .attention-requise {
      background-color: #fef3c7;
      color: #92400e;
    }
    
    .en-retard {
      background-color: #fee2e2;
      color: #b91c1c;
    }
    
    .task-container {
      padding: 1rem;
      background-color: #f9fafb;
      border-radius: 0.5rem;
      margin-top: 0.5rem;
    }
    
    .task-title {
      font-size: 1rem;
      font-weight: 600;
      color: #0a4955;
      margin-bottom: 0.5rem;
    }
    
    .task-list {
      list-style-type: none;
      padding: 0;
      margin: 0;
    }
    
    .task-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .task-name {
      color: #0a4955;
    }
    
    .task-deadline {
      color: #6b7280;
      font-size: 0.875rem;
    }
  `],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('expand', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('0.3s ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.3s ease-out', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})
export class StartupsTableComponent implements OnInit {
  @Input() startups: Startup[] = [];
  loading = true;

  animatedValues: { 
    [key: string]: {
      progress: number;
      satisfaction: number;
      score: number;
    }
  } = {};

  expandedRow: string | null = null;

  ngOnInit() {
    if (this.startups?.length) {
      this.animateProgressBars();
      this.loading = false;
    }
  }

  ngOnChanges() {
    if (this.startups?.length) {
      this.animatedValues = {};
      this.animateProgressBars();
      this.loading = false;
    }
  }

  animateProgressBars() {
    this.startups.forEach(startup => {
      this.animateValue(startup.name, 'progress', startup.progress);
      this.animateValue(startup.name, 'satisfaction', startup.satisfaction);
      this.animateValue(startup.name, 'score', startup.score);
    });
  }

  animateValue(key: string, type: 'progress' | 'satisfaction' | 'score', targetValue: number) {
    if (!this.animatedValues[key]) {
      this.animatedValues[key] = { progress: 0, satisfaction: 0, score: 0 };
    }

    const duration = 2000;
    const increment = targetValue / (duration / 16);
    let currentValue = 0;

    const updateAnimation = () => {
      currentValue += increment;
      if (currentValue >= targetValue) {
        currentValue = targetValue;
      }

      this.animatedValues[key][type] = type === 'score' 
        ? parseFloat(currentValue.toFixed(1)) 
        : Math.round(currentValue);

      if (currentValue < targetValue) {
        requestAnimationFrame(updateAnimation);
      }
    };

    requestAnimationFrame(updateAnimation);
  }

  getAnimatedValue(key: string, type: 'progress' | 'satisfaction' | 'score'): number {
    return this.animatedValues[key]?.[type] || 0;
  }

  getStatusClass(status: string) {
    return {
      'en-bonne-voie': status === 'En Bonne Voie',
      'attention-requise': status === 'Attention Requise',
      'en-retard': status === 'En Retard',
    };
  }

  toggleExpand(startupName: string) {
    this.expandedRow = this.expandedRow === startupName ? null : startupName;
  }
}