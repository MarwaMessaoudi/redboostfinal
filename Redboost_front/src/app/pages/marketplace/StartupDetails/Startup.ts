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
    <div class="bg-gradient-to-r from-[#EA7988] to-[#FF8B79] min-h-screen text-white">
      <!-- Header Section -->
      <header class="py-12 text-center">
        <h1 class="text-5xl font-extrabold">{{ projet?.name || 'Project Details' }}</h1>
        <p class="mt-4 text-xl max-w-lg mx-auto">{{ projet?.description || 'An innovative project aimed to revolutionize the industry.' }}</p>
        <button (click)="goBack()" class="mt-8 px-6 py-3 bg-[#0A4955] text-lg font-semibold rounded-lg shadow-lg hover:bg-[#245C67]">
          ← Back to Investments
        </button>
      </header>

      <!-- Main Content Section -->
      <main class="container mx-auto px-6 py-12 max-w-5xl space-y-12">
        <!-- Project Overview -->
        <div class="text-center bg-white p-8 rounded-lg shadow-lg">
          <h2 class="text-3xl font-semibold text-[#245C67]">Project Overview</h2>
          <p class="text-[#568086] text-lg mt-4">{{ projet?.name }}</p>
          <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-8 text-[#568086]">
            <div>
              <strong>Sector:</strong> {{ projet?.sector }}
            </div>
            <div>
              <strong>Location:</strong> {{ projet?.location }}
            </div>
            <div>
              <strong>Founded:</strong> {{ projet?.creationDate | date:'yyyy' }}
            </div>
            <div>
              <strong>Team Size:</strong> {{ projet?.numberOfEmployees }}
            </div>
          </div>
        </div>

        <!-- Financial Overview -->
        <div class="text-center bg-white p-8 rounded-lg shadow-lg">
          <h3 class="text-2xl font-semibold text-[#245C67] mb-4">Financial Overview</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="p-6 bg-[#A0CED9] rounded-lg">
              <h4 class="text-lg text-[#245C67]">Revenue</h4>
              <p class="text-xl font-bold">{{ projet?.revenue | currency }}</p>
            </div>
            <div class="p-6 bg-[#568086] rounded-lg">
              <h4 class="text-lg text-[#EA7988]">Funding Goal</h4>
              <p class="text-xl font-bold">{{ projet?.fundingGoal | currency }}</p>
            </div>
          </div>
        </div>

        <!-- Investor Information -->
        <div class="text-center bg-white p-8 rounded-lg shadow-lg">
          <h3 class="text-2xl font-semibold text-[#245C67] mb-4">Your Investment</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div class="p-6 bg-[#A0CED9] rounded-lg">
              <h4 class="text-lg text-[#245C67]">Invested Amount</h4>
              <p class="text-xl font-bold">{{ investment?.proposedAmount | currency }}</p>
            </div>
            <div class="p-6 bg-[#568086] rounded-lg">
              <h4 class="text-lg text-[#E44D62]">Equity Stake</h4>
              <p class="text-xl font-bold">{{ investment?.equityPercentage }}%</p>
            </div>
            <div class="p-6 bg-[#E88D9A] rounded-lg">
              <h4 class="text-lg text-[#DB1E37]">Current ROI</h4>
              <p class="text-xl font-bold">{{ calculateROI() | percent:'1.2-2' }}</p>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div class="bg-white p-8 rounded-lg shadow-lg">
            <h4 class="text-xl font-semibold text-[#245C67] mb-6">Revenue</h4>
            <canvas id="revenueChart" class="w-full h-48"></canvas>
          </div>
          <div class="bg-white p-8 rounded-lg shadow-lg">
            <h4 class="text-xl font-semibold text-[#245C67] mb-6">Funding Progress</h4>
            <canvas id="fundingChart" class="w-full h-48"></canvas>
          </div>
        </div>
      </main>

      <!-- Footer Section -->
      <footer class="bg-[#0A4955] text-center py-8 text-white">
        <p>&copy; 2025 {{ projet?.name }}. All Rights Reserved.</p>
      </footer>
    </div>
  `,
  styles: [`
    canvas {
      max-height: 200px;
    }
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