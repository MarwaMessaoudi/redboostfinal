import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-investor-startups',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold mb-4">My Investments</h1>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let request of investmentRequests" class="p-4 border rounded shadow-md bg-white">
          <h2 class="text-xl font-semibold">{{ request.startup?.name }}</h2>
          <p class="text-sm text-gray-500">{{ request.startup?.industry }}</p>
          <p class="mt-2">{{ request.startup?.description }}</p>
          <p class="mt-4 text-sm font-medium">Investment Amount: {{ request.proposedAmount | currency }}</p>
          
          <p class="mt-2 text-sm">
            Status:
            <span [class.text-green-500]="request.status === 'ACCEPTED'"
                  [class.text-red-500]="request.status === 'DECLINED'"
                  [class.text-yellow-500]="request.status === 'PENDING'">
              {{ request.status }}
            </span>
          </p>

          <!-- Show More Info Button -->
          <button *ngIf="request.status === 'ACCEPTED'" 
                  class="mt-4 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                  (click)="toggleDetails(request.id)">
            📊 View Startup Details
          </button>

          <!-- Startup Details with Charts -->
          <div *ngIf="selectedStartupId === request.id" class="mt-4 p-4 border rounded bg-gray-100">
            <h3 class="text-lg font-bold">Startup Financial Overview</h3>
            <p><strong>Industry:</strong> {{ request.startup?.industry }}</p>
            <p><strong>Description:</strong> {{ request.startup?.description }}</p>
            <p><strong>Revenue:</strong> {{ request.startup?.revenue | currency }}</p>

            <!-- Charts -->
            <div class="mt-6">
              <h4 class="text-md font-semibold">📈 Revenue Growth</h4>
              <canvas [id]="'revenue-chart-' + request.id"></canvas>
            </div>

            <div class="mt-6">
              <h4 class="text-md font-semibold">📊 Profit vs. Expenses</h4>
              <canvas [id]="'profit-chart-' + request.id"></canvas>
            </div>

            <div class="mt-6">
              <h4 class="text-md font-semibold">🌍 Market Share Distribution</h4>
              <canvas [id]="'market-chart-' + request.id"></canvas>
            </div>

          </div>
        </div>
      </div>
    </div>
  `,
  styles: [` 
    .container { max-width: 900px; }
  `]
})
export class InvestorStartupsComponent {
  investmentRequests: any[] = [];
  investorId: number = 1; // Replace with actual logged-in investor ID
  selectedStartupId: number | null = null;

  constructor(private http: HttpClient) {
    this.fetchInvestorStartups();
  }

  fetchInvestorStartups() {
    this.http.get(`http://localhost:8085/api/investment-requests/investor/${this.investorId}`)
      .subscribe({
        next: (response: any) => {
          this.investmentRequests = response; 
        },
        error: (error) => {
          console.error('Error fetching investment requests:', error);
        }
      });
  }

  toggleDetails(startupId: number) {
    this.selectedStartupId = this.selectedStartupId === startupId ? null : startupId;
    if (this.selectedStartupId) {
      setTimeout(() => this.loadCharts(startupId), 100);
    }
  }

  loadCharts(startupId: number) {
    const startup = this.investmentRequests.find(req => req.id === startupId)?.startup;
    if (!startup) return;

    // Destroy existing charts before rendering new ones (to prevent duplication)
    Chart.getChart(`revenue-chart-${startupId}`)?.destroy();
    Chart.getChart(`profit-chart-${startupId}`)?.destroy();
    Chart.getChart(`market-chart-${startupId}`)?.destroy();

    // Revenue Growth Line Chart
    new Chart(document.getElementById(`revenue-chart-${startupId}`) as HTMLCanvasElement, {
      type: 'line',
      data: {
        labels: ['2019', '2020', '2021', '2022', '2023'],
        datasets: [{
          label: 'Revenue ($)',
          data: startup.revenueGrowth || [10000, 25000, 50000, 75000, 100000], // Sample data
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          fill: true
        }]
      }
    });

    // Profit vs. Expenses Bar Chart
    new Chart(document.getElementById(`profit-chart-${startupId}`) as HTMLCanvasElement, {
      type: 'bar',
      data: {
        labels: ['Revenue', 'Expenses', 'Profit'],
        datasets: [{
          label: 'Financial Overview',
          data: [startup.revenue, startup.expenses, startup.revenue - startup.expenses],
          backgroundColor: ['#4CAF50', '#FF4500', '#2196F3']
        }]
      }
    });

    // Market Share Pie Chart
    new Chart(document.getElementById(`market-chart-${startupId}`) as HTMLCanvasElement, {
      type: 'pie',
      data: {
        labels: ['Company A', 'Company B', 'Company C', 'This Startup'],
        datasets: [{
          label: 'Market Share',
          data: [30, 25, 20, 25], // Sample values
          backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FFC300']
        }]
      }
    });
  }
}
