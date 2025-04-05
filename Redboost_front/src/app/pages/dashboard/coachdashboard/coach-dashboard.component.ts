import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { KpiCardsComponent } from './components/kpi-cards.component';
import { StartupsTableComponent } from './components/startups-table.component';
import { CoachDashboardService, Kpi, Startup } from '../../service/coachdashboard.service';
import { LoadingSpinnerComponent } from '../../../shared/loading-spinner.component';

@Component({
  selector: 'app-coach-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    KpiCardsComponent,
    StartupsTableComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="dashboard-container">
      <!-- Loading State -->
      <app-loading-spinner *ngIf="isLoading" [size]="'lg'" [message]="'Chargement du tableau de bord...'"></app-loading-spinner>

      <!-- Error State -->
      <div *ngIf="!isLoading && errorMessage" class="error-message">
        {{ errorMessage }}
        <button (click)="retryLoading()" class="retry-button">Réessayer</button>
      </div>

      <!-- Content -->
      <div *ngIf="!isLoading && !errorMessage">
        <app-kpi-cards [kpis]="kpiData" />
        <app-startups-table [startups]="startupData" />
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        padding: 2rem;
        background: #f9fafb;
        font-family: 'Poppins', sans-serif;
        min-height: 100vh;
      }
      
      .error-message {
        padding: 1rem;
        background-color: #FFF5F6;
        border: 1px solid #DB1E37;
        color: #DB1E37;
        border-radius: 0.5rem;
        text-align: center;
      }
      
      .retry-button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: #DB1E37;
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
      }
    `
  ]
})
export class CoachDashboardComponent implements OnInit {
  kpiData: Kpi[] = [];
  startupData: Startup[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(private dashboardService: CoachDashboardService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.dashboardService.getKPIs().subscribe({
      next: (data) => this.kpiData = data,
      error: (err) => this.handleError(err, 'Failed to load KPIs')
    });
    
    this.dashboardService.getStartups().subscribe({
      next: (data) => this.startupData = data,
      error: (err) => this.handleError(err, 'Failed to load startups'),
      complete: () => this.isLoading = false
    });
  }

  retryLoading() {
    this.loadData();
  }

  private handleError(error: any, message: string) {
    console.error(error);
    this.errorMessage = message;
    this.isLoading = false;
  }
}