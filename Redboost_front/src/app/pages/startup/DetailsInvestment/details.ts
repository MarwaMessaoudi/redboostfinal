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
          <h1 class="text-3xl font-bold">{{ projet?.name || 'Project Details' }}</h1>
          <button (click)="goBack()" class="bg-white text-[#0A4955] px-4 py-2 rounded-md hover:bg-[#A0CED9]">
            ← Back to Investments
          </button>
        </div>
      </header>

      <main class="container mx-auto px-6 py-8 max-w-5xl">
        <div *ngIf="projet && !loading; else loadingOrError" class="bg-white p-8 rounded-lg shadow-md">
          <!-- Overview -->
          <div class="mb-8">
            <h2 class="text-2xl font-semibold text-[#245C67] mb-2">{{ projet.name }}</h2>
            <p class="text-[#568086]">{{ projet.description }}</p>
            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[#568086]">
              <p><strong>Sector:</strong> {{ projet.sector }}</p>
              <p><strong>Location:</strong> {{ projet.location }}</p>
              <p><strong>Founded:</strong> {{ projet.creationDate | date:'yyyy' }}</p>
              <p><strong>Team Size:</strong> {{ projet.numberOfEmployees }}</p>
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
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-[#A0CED9] p-4 rounded-md text-center">
                <p class="text-sm text-[#568086]">Revenue</p>
                <p class="text-2xl font-bold text-[#0A4955]">{{ projet.revenue | currency }}</p>
              </div>
              <div class="bg-[#7BB4C2] p-4 rounded-md text-center">
                <p class="text-sm text-[#568086]">Funding Goal</p>
                <p class="text-2xl font-bold text-[#245C67]">{{ projet.fundingGoal | currency }}</p>
              </div>
            </div>
          </div>

          <!-- Detailed Project Metrics -->
          <div class="mb-8">
            <h3 class="text-xl font-semibold text-[#245C67] mb-4">Project Metrics</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[#568086]">
              <p><strong>Status:</strong> {{ projet.status }}</p>
              <p><strong>Objectives:</strong> {{ projet.objectives }}</p>
              <p><strong>Global Score:</strong> {{ projet.globalScore }}</p>
            </div>
          </div>

          <!-- Charts -->
          <div class="space-y-8">
            <div class="bg-white p-4 rounded-md shadow-md">
              <h4 class="text-lg font-semibold text-[#245C67] mb-3">Revenue</h4>
              <canvas id="revenueChart" class="w-full h-48"></canvas>
            </div>
            <div class="bg-white p-4 rounded-md shadow-md">
              <h4 class="text-lg font-semibold text-[#245C67] mb-3">Funding Progress</h4>
              <canvas id="fundingChart" class="w-full h-48"></canvas>
            </div>
          </div>
        </div>

        <!-- Loading/Error States -->
        <ng-template #loadingOrError>
          <div *ngIf="loading" class="text-center text-[#568086] mt-8 animate-pulse">Loading project details...</div>
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
  projet: any = null;
  investment: any = null;
  investorId: number = 1; // Replace with actual investor ID from auth service
  loading: boolean = false;
  errorMessage: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const projetId = +this.route.snapshot.paramMap.get('id')!;
    if (projetId) {
      this.fetchProjetDetails(projetId);
    } else {
      this.errorMessage = 'No project ID provided';
    }
  }

  async fetchProjetDetails(projetId: number) {
    this.loading = true;
    this.errorMessage = '';

    try {
      // Fetch project details
      const projetResponse = await axios.get(`http://localhost:8085/api/projets/GetProjet/${projetId}`);
      this.projet = projetResponse.data;

      // Fetch investment details for this investor and project
      const investmentResponse = await axios.get(`http://localhost:8085/api/investment-requests/investor/${this.investorId}`);
      const investments = investmentResponse.data;
      this.investment = investments.find((inv: any) => inv.projet?.id === projetId && inv.status === 'ACCEPTED');

      if (!this.investment) {
        this.errorMessage = 'No accepted investment found for this project.';
      }

      setTimeout(() => this.renderCharts(), 0); // Ensure DOM is updated before rendering charts
    } catch (error) {
      console.error('Error fetching project or investment details:', error);
      this.errorMessage = 'Failed to load project details. Please try again later.';
    } finally {
      this.loading = false;
    }
  }

  calculateROI(): number {
    if (!this.projet || !this.investment) return 0;
    const currentValue = this.projet.revenue * 0.1; // Simplified ROI calculation
    return (currentValue - this.investment.proposedAmount) / this.investment.proposedAmount;
  }

  renderCharts() {
    if (!this.projet) return;

    // Revenue Chart (single value bar chart as revenue history isn't provided)
    new Chart(document.getElementById('revenueChart') as HTMLCanvasElement, {
      type: 'bar',
      data: {
        labels: ['Current Revenue'],
        datasets: [{
          label: 'Revenue ($)',
          data: [this.projet.revenue || 0],
          backgroundColor: '#0A4955',
          borderWidth: 1,
          borderColor: '#fff'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
    });

    // Funding Progress
    new Chart(document.getElementById('fundingChart') as HTMLCanvasElement, {
      type: 'doughnut',
      data: {
        labels: ['Raised', 'Remaining'],
        datasets: [{
          data: [this.projet.investmentRequests?.reduce((sum: number, inv: any) => sum + (inv.status === 'ACCEPTED' ? inv.proposedAmount : 0), 0) || 0, this.projet.fundingGoal - (this.projet.investmentRequests?.reduce((sum: number, inv: any) => sum + (inv.status === 'ACCEPTED' ? inv.proposedAmount : 0), 0) || 0)],
          backgroundColor: ['#E44D62', '#EA7988'],
          borderWidth: 1,
          borderColor: '#fff'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, tooltip: { callbacks: { label: (context) => `${context.label}: $${context.raw}` } } } }
    });
  }

  goBack() {
    this.router.navigate(['/investor-startups']);
  }
}