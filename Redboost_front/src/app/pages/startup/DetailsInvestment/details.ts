import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import axios from 'axios';

@Component({
  selector: 'app-startup-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#EA7988]">
      <header class="bg-[#0A4955] text-white py-6 shadow-lg">
        <div class="container mx-auto px-6 flex justify-between items-center">
          <h1 class="text-3xl font-bold">{{ startup?.name || 'Startup Details' }}</h1>
          <button (click)="goBack()" class="bg-white text-[#0A4955] px-4 py-2 rounded-md hover:bg-[#A0CED9]">
            ← Back to Investments
          </button>
        </div>
      </header>

      <main class="container mx-auto px-6 py-8 max-w-5xl">
        <div *ngIf="startup && !loading; else loadingOrError" class="bg-white p-8 rounded-lg shadow-md">
          <!-- Overview -->
          <div class="mb-8">
            <h2 class="text-2xl font-semibold text-[#245C67] mb-2">{{ startup.name }}</h2>
            <p class="text-[#568086]">{{ startup.description }}</p>
            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[#568086]">
              <p><strong>Industry:</strong> {{ startup.industry }}</p>
              <p><strong>Location:</strong> {{ startup.location }}</p>
              <p><strong>Founded:</strong> {{ startup.foundedYear }}</p>
              <p><strong>Team Size:</strong> {{ startup.teamSize }}</p>
            </div>
          </div>

          <!-- Investor Stake -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-[#245C67] mb-4">Your Investment</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="bg-[#A0CED9] p-4 rounded-md text-center">
                <p class="text-sm text-[#568086]">Invested Amount</p>
                <p class="text-2xl font-bold text-[#0A4955]">{{ investment?.proposedAmount | currency }}</p>
              </div>
              <div class="bg-[#568086] p-4 rounded-md text-center">
                <p class="text-sm text-[#EA7988]">Equity Stake</p>
                <p class="text-2xl font-bold text-[#E44D62]">{{ investment?.equityPercentage }}%</p>
              </div>
              <div class="bg-[#E88D9A] p-4 rounded-md text-center">
                <p class="text-sm text-[#568086]">Current ROI</p>
                <p class="text-2xl font-bold text-[#DB1E37]">{{ calculateROI() | percent:'1.2-2' }}</p>
              </div>
            </div>
            <div class="mt-4 text-[#568086]">
              <p><strong>Investment Date:</strong> {{ investment?.investmentDate | date:'mediumDate' }}</p>
            </div>
          </div>

          <!-- Financial Overview -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-[#245C67] mb-4">Financial Overview</h3>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div class="bg-[#A0CED9] p-4 rounded-md text-center">
                <p class="text-sm text-[#568086]">Revenue</p>
                <p class="text-2xl font-bold text-[#0A4955]">{{ startup.revenue | currency }}</p>
              </div>
              <div class="bg-[#EA7988] p-4 rounded-md text-center">
                <p class="text-sm text-[#568086]">Expenses</p>
                <p class="text-2xl font-bold text-[#DB1E37]">{{ startup.expenses | currency }}</p>
              </div>
              <div class="bg-[#568086] p-4 rounded-md text-center">
                <p class="text-sm text-[#EA7988]">Profit</p>
                <p class="text-2xl font-bold text-[#E44D62]">{{ (startup.revenue - startup.expenses) | currency }}</p>
              </div>
              <div class="bg-[#7BB4C2] p-4 rounded-md text-center">
                <p class="text-sm text-[#568086]">Cash Reserves</p>
                <p class="text-2xl font-bold text-[#245C67]">{{ startup.cashReserves | currency }}</p>
              </div>
            </div>
          </div>

          <!-- Detailed Investment Metrics -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-[#245C67] mb-4">Investment Metrics</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[#568086]">
              <p><strong>Total Funding Raised:</strong> {{ startup.fundingRaised | currency }}</p>
              <p><strong>Funding Goal:</strong> {{ startup.fundingGoal | currency }}</p>
              <p><strong>Valuation:</strong> {{ startup.valuation | currency }}</p>
            </div>
          </div>

          <!-- Charts -->
          <div class="space-y-8">
            <div class="bg-white p-4 rounded-md shadow-md">
              <h4 class="text-lg font-semibold text-[#245C67] mb-3">Revenue Growth</h4>
              <canvas id="revenueChart" class="w-full h-48"></canvas>
            </div>
            <div class="bg-white p-4 rounded-md shadow-md">
              <h4 class="text-lg font-semibold text-[#245C67] mb-3">Profit vs Expenses</h4>
              <canvas id="profitChart" class="w-full h-48"></canvas>
            </div>
            <div class="bg-white p-4 rounded-md shadow-md">
              <h4 class="text-lg font-semibold text-[#245C67] mb-3">Market Share</h4>
              <canvas id="marketChart" class="w-full h-48"></canvas>
            </div>
            <div class="bg-white p-4 rounded-md shadow-md">
              <h4 class="text-lg font-semibold text-[#245C67] mb-3">Funding Progress</h4>
              <canvas id="fundingChart" class="w-full h-48"></canvas>
            </div>
            <div class="bg-white p-4 rounded-md shadow-md">
              <h4 class="text-lg font-semibold text-[#245C67] mb-3">User Growth</h4>
              <canvas id="userGrowthChart" class="w-full h-48"></canvas>
            </div>
            <div class="bg-white p-4 rounded-md shadow-md">
              <h4 class="text-lg font-semibold text-[#245C67] mb-3">ROI Over Time</h4>
              <canvas id="roiChart" class="w-full h-48"></canvas>
            </div>
            <div class="bg-white p-4 rounded-md shadow-md">
              <h4 class="text-lg font-semibold text-[#245C67] mb-3">Cash Flow</h4>
              <canvas id="cashFlowChart" class="w-full h-48"></canvas>
            </div>
          </div>
        </div>

        <!-- Loading/Error States -->
        <ng-template #loadingOrError>
          <div *ngIf="loading" class="text-center text-[#568086] mt-8 animate-pulse">Loading startup details...</div>
          <div *ngIf="errorMessage" class="text-center text-[#DB1E37] mt-8">{{ errorMessage }}</div>
        </ng-template>
      </main>
    </div>
  `,
  styles: [`
    canvas { max-height: 192px; }
  `]
})
export class StartupDetailsComponent implements OnInit {
  startup: any = null;
  investment: any = null;
  investorId: number = 1; // Replace with actual investor ID from auth service
  loading: boolean = false;
  errorMessage: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const startupId = +this.route.snapshot.paramMap.get('id')!;
    if (startupId) {
      this.fetchStartupDetails(startupId);
    } else {
      this.errorMessage = 'No startup ID provided';
    }
  }

  async fetchStartupDetails(startupId: number) {
    this.loading = true;
    this.errorMessage = '';

    try {
      // Fetch startup details
      const startupResponse = await axios.get(`http://localhost:8085/api/startups/${startupId}`);
      this.startup = startupResponse.data;

      // Fetch investment details for this investor and startup
      const investmentResponse = await axios.get(`http://localhost:8085/api/investment-requests/investor/${this.investorId}`);
      const investments = investmentResponse.data;
      this.investment = investments.find((inv: any) => inv.startup?.id === startupId && inv.status === 'ACCEPTED');

      if (!this.investment) {
        this.errorMessage = 'No accepted investment found for this startup.';
      }

      setTimeout(() => this.renderCharts(), 0); // Ensure DOM is updated before rendering charts
    } catch (error) {
      console.error('Error fetching startup or investment details:', error);
      this.errorMessage = 'Failed to load startup details. Please try again later.';
    } finally {
      this.loading = false;
    }
  }

  calculateROI(): number {
    if (!this.startup || !this.investment) return 0;
    const currentValue = this.startup.revenue * 0.1; // Simplified ROI calculation
    return (currentValue - this.investment.proposedAmount) / this.investment.proposedAmount;
  }

  renderCharts() {
    if (!this.startup) return;

    // Default labels if not provided by API
    const revenueLabels = this.startup.revenueGrowthYears || ['2019', '2020', '2021', '2022', '2023'];
    const userGrowthLabels = this.startup.userGrowthMonths || ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
    const roiLabels = this.investment?.roiHistoryMonths || ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'];
    const cashFlowLabels = this.startup.cashFlowMonths || ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

    // Revenue Growth
    new Chart(document.getElementById('revenueChart') as HTMLCanvasElement, {
      type: 'line',
      data: {
        labels: revenueLabels,
        datasets: [{
          label: 'Revenue ($)',
          data: this.startup.revenueGrowth || [0, 0, 0, 0, 0],
          borderColor: '#0A4955',
          backgroundColor: 'rgba(10, 73, 85, 0.2)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#0A4955',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
    });

    // Profit vs Expenses
    new Chart(document.getElementById('profitChart') as HTMLCanvasElement, {
      type: 'bar',
      data: {
        labels: ['Revenue', 'Expenses', 'Profit'],
        datasets: [{
          label: 'Financials',
          data: [this.startup.revenue, this.startup.expenses, this.startup.revenue - this.startup.expenses],
          backgroundColor: ['#0A4955', '#DB1E37', '#E44D62'],
          borderWidth: 1,
          borderColor: '#fff'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
    });

    // Market Share
    new Chart(document.getElementById('marketChart') as HTMLCanvasElement, {
      type: 'pie',
      data: {
        labels: ['Competitor A', 'Competitor B', 'Competitor C', 'This Startup'],
        datasets: [{
          data: this.startup.marketShare ? [...this.startup.marketShare.competitors, this.startup.marketShare.thisStartup] : [30, 25, 20, 25],
          backgroundColor: ['#DB1E37', '#E44D62', '#245C67', '#568086'],
          borderWidth: 1,
          borderColor: '#fff'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }
    });

    // Funding Progress
    new Chart(document.getElementById('fundingChart') as HTMLCanvasElement, {
      type: 'doughnut',
      data: {
        labels: ['Raised', 'Remaining'],
        datasets: [{
          data: [this.startup.fundingRaised, this.startup.fundingGoal - this.startup.fundingRaised],
          backgroundColor: ['#E44D62', '#EA7988'],
          borderWidth: 1,
          borderColor: '#fff'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, tooltip: { callbacks: { label: (context) => `${context.label}: $${context.raw}` } } } }
    });

    // User Growth
    new Chart(document.getElementById('userGrowthChart') as HTMLCanvasElement, {
      type: 'line',
      data: {
        labels: userGrowthLabels,
        datasets: [{
          label: 'Users',
          data: this.startup.userGrowth || [0, 0, 0, 0, 0],
          borderColor: '#245C67',
          backgroundColor: 'rgba(36, 92, 103, 0.2)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#245C67',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
    });

    // ROI Over Time
    new Chart(document.getElementById('roiChart') as HTMLCanvasElement, {
      type: 'line',
      data: {
        labels: roiLabels,
        datasets: [{
          label: 'ROI (%)',
          data: this.investment?.roiHistory || [0, 0, 0, 0, 0],
          borderColor: '#568086',
          backgroundColor: 'rgba(86, 128, 134, 0.2)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#568086',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
    });

    // Cash Flow
    new Chart(document.getElementById('cashFlowChart') as HTMLCanvasElement, {
      type: 'bar',
      data: {
        labels: cashFlowLabels,
        datasets: [{
          label: 'Cash Flow ($)',
          data: this.startup.cashFlow || [0, 0, 0, 0, 0],
          backgroundColor: '#E88D9A',
          borderWidth: 1,
          borderColor: '#fff'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
    });
  }

  goBack() {
    this.router.navigate(['/investor-startups']);
  }
}