import { Component } from '@angular/core';
import { KpiCardsComponent } from './components/kpi-cards.component';
import { StartupsTableComponent } from './components/startups-table.component';

@Component({
  selector: 'app-coach-dashboard',
  standalone: true,
  imports: [KpiCardsComponent, StartupsTableComponent],
  template: `
    <div class="dashboard-container">
      <!-- KPIs Section -->
      <app-kpi-cards />

      <!-- Startups Table Section -->
      <app-startups-table />
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
      }
    `,
  ],
})
export class CoachDashboardComponent {}