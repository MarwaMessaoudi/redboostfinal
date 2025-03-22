import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  standalone: true, // Mark as standalone
  selector: 'app-startups-table',
  imports: [CommonModule, TableModule, ProgressBarModule, TooltipModule], // Import required modules
  template: `
    <div class="table-container">
      <h2 class="table-title">Startups Guidées</h2>
      <p-table [value]="startups" [paginator]="true" [rows]="5" [rowsPerPageOptions]="[5, 10, 20]">
        <ng-template pTemplate="header">
          <tr>
            <th>Startup</th>
            <th>Taux de Satisfaction</th>
            <th>Progrès</th>
            <th>Score </th>
            <th>Statut</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-startup>
          <tr [@fadeIn] class="hover-row" (click)="toggleExpand(startup.name)">
            <td>{{ startup.name }}</td>
            <td>
              <div class="progress-bar">
                <div class="progress-fill" [ngStyle]="{ width: animatedSatisfaction[startup.name] + '%', 'background-color': '#DB1E37' }"></div>
              </div>
              <span class="satisfaction-text">{{ animatedSatisfaction[startup.name] || '0' }}%</span>
            </td>
            <td>
              <div class="progress-bar">
                <div class="progress-fill" [ngStyle]="{ width: animatedProgress[startup.name] + '%', 'background-color': '#DB1E37' }"></div>
              </div>
              <span class="progress-text">{{ animatedProgress[startup.name] || '0' }}%</span>
            </td>
            <td>
              <span class="score-text">{{ animatedScore[startup.name] || '0' }}</span>
            </td>
            <td>
              <span class="status-badge" [ngClass]="getStatusClass(startup.status)" [pTooltip]="startup.status" tooltipPosition="top">
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
                    <span class="task-deadline">{{ task.deadline }}</span>
                  </li>
                </ul>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [
    `
      .table-container {
        background: white;
        border-radius: 1rem;
        padding: 1.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .table-title {
        color: #0a4955;
        font-size: 1.75rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
      }

      .p-table th {
        background-color: #f9fafb;
        font-weight: 600;
        color: #0a4955;
        padding: 1rem;
        text-align: left;
      }

      .p-table td {
        padding: 1rem;
        text-align: left;
      }

      .progress-bar {
        width: 100%;
        height: 0.5rem;
        background: #e5e7eb;
        border-radius: 0.25rem;
        overflow: hidden;
        position: relative;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .progress-fill {
        height: 100%;
        border-radius: 0.25rem;
        transition: width 0.5s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .progress-text, .satisfaction-text {
        display: block;
        margin-top: 0.5rem;
        font-size: 0.875rem;
        color: #4b5563;
        font-weight: 500;
      }

      .score-text {
        font-size: 1rem;
        color: #0a4955;
        font-weight: 600;
      }

      .status-badge {
        padding: 0.5rem 1rem;
        border-radius: 1rem;
        font-size: 0.875rem;
        font-weight: 600;
        display: inline-block;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .status-badge.en-bonne-voie {
        background: #dcfce7;
        color: #166534;
      }

      .status-badge.attention-requise {
        background: #fef9c3;
        color: #854d0e;
      }

      .status-badge.en-retard {
        background: #fee2e2;
        color: #991b1b;
      }

      .hover-row:hover {
        background-color: #f9fafb;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .task-container {
        padding: 1rem;
        background: #f9fafb;
        border-radius: 0.5rem;
        margin-top: 0.5rem;
        animation: fadeIn 0.3s ease-out;
      }

      .task-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: #0a4955;
        margin-bottom: 0.75rem;
      }

      .task-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .task-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid #e5e7eb;
        transition: background-color 0.2s ease;
      }

      .task-item:hover {
        background-color: #f3f4f6;
      }

      .task-item:last-child {
        border-bottom: none;
      }

      .task-name {
        font-size: 0.875rem;
        color: #4b5563;
        font-weight: 500;
      }

      .task-deadline {
        font-size: 0.875rem;
        color: #991b1b;
        font-weight: 600;
      }
    `,
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('expand', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('0.3s ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('0.3s ease-out', style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
})
export class StartupsTableComponent implements OnInit {
  startups = [
    {
      name: 'Startup A',
      sector: 'Tech',
      progress: 85,
      satisfaction: 90,
      score: 8.5,
      status: 'En Bonne Voie',
      tasks: [
        { name: 'Task 1', deadline: '2023-10-15' },
        { name: 'Task 2', deadline: '2023-10-20' },
        { name: 'Task 3', deadline: '2023-10-25' },
      ]
    },
    {
      name: 'Startup B',
      sector: 'Santé',
      progress: 60,
      satisfaction: 75,
      score: 6.0,
      status: 'Attention Requise',
      tasks: [
        { name: 'Task 1', deadline: '2023-10-16' },
        { name: 'Task 2', deadline: '2023-10-21' },
        { name: 'Task 3', deadline: '2023-10-26' },
      ]
    },
    {
      name: 'Startup C',
      sector: 'Éducation',
      progress: 45,
      satisfaction: 50,
      score: 4.5,
      status: 'En Retard',
      tasks: [
        { name: 'Task 1', deadline: '2023-10-17' },
        { name: 'Task 2', deadline: '2023-10-22' },
        { name: 'Task 3', deadline: '2023-10-27' },
      ]
    },
    {
      name: 'Startup D',
      sector: 'Fintech',
      progress: 90,
      satisfaction: 95,
      score: 9.0,
      status: 'En Bonne Voie',
      tasks: [
        { name: 'Task 1', deadline: '2023-10-18' },
        { name: 'Task 2', deadline: '2023-10-23' },
        { name: 'Task 3', deadline: '2023-10-28' },
      ]
    },
    {
      name: 'Startup E',
      sector: 'Agritech',
      progress: 70,
      satisfaction: 80,
      score: 7.0,
      status: 'Attention Requise',
      tasks: [
        { name: 'Task 1', deadline: '2023-10-19' },
        { name: 'Task 2', deadline: '2023-10-24' },
        { name: 'Task 3', deadline: '2023-10-29' },
      ]
    },
  ];

  animatedProgress: { [key: string]: number } = {}; // Stores animated progress values
  animatedSatisfaction: { [key: string]: number } = {}; // Stores animated satisfaction values
  animatedScore: { [key: string]: number } = {}; // Stores animated score values
  expandedRow: string | null = null; // Tracks the expanded row

  ngOnInit() {
    this.animateProgressBars();
  }

  // Function to animate progress bars and score
  animateProgressBars() {
    this.startups.forEach((startup) => {
      this.animateValue(startup.name, 'progress', startup.progress);
      this.animateValue(startup.name, 'satisfaction', startup.satisfaction);
      this.animateValue(startup.name, 'score', startup.score * 10); // Multiply by 10 to convert to a percentage for animation
    });
  }

  // Helper function to animate a value
  animateValue(key: string, type: 'progress' | 'satisfaction' | 'score', targetValue: number) {
    const duration = 2000; // Animation duration in milliseconds
    const increment = targetValue / (duration / 16); // Increment for the progress

    let currentValue = 0;

    const updateAnimation = () => {
      currentValue += increment;
      if (currentValue >= targetValue) {
        currentValue = targetValue;
      }

      if (type === 'progress') {
        this.animatedProgress[key] = Math.round(currentValue);
      } else if (type === 'satisfaction') {
        this.animatedSatisfaction[key] = Math.round(currentValue);
      } else if (type === 'score') {
        this.animatedScore[key] = Math.round(currentValue) / 10; // Divide by 10 to get the score out of 10
      }

      if (currentValue < targetValue) {
        requestAnimationFrame(updateAnimation);
      }
    };

    requestAnimationFrame(updateAnimation);
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