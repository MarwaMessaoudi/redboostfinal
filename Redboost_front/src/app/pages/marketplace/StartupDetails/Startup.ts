import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { Chart, ChartConfiguration, ChartData, ChartOptions, LineController, LineElement, BarController, BarElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js';

// ✅ Register required Chart.js controllers
Chart.register(LineController, LineElement, BarController, BarElement, PointElement, LinearScale, CategoryScale, Title);

@Component({
  selector: 'app-startup-details',
  standalone: true,
  imports: [CommonModule, NgIf], // ✅ Fixed imports
  template: `
    <div class="container mx-auto p-6 max-w-3xl">
      <button (click)="goBack()" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 mb-4">
        ← Back to Marketplace
      </button>

      <div *ngIf="startup" class="p-6 border rounded-lg shadow-lg bg-white">
        <h1 class="text-3xl font-bold text-gray-800">{{ startup.name }}</h1>
        <p class="text-gray-500">{{ startup.category }}</p>
        <p class="mt-4 text-gray-700">{{ startup.description }}</p>

        <div class="mt-6">
          <h3 class="text-lg font-semibold">Funding Progress</h3>
          <div class="w-full bg-gray-300 rounded-full h-6 mt-2">
            <div class="h-6 bg-blue-500 text-white text-center rounded-full" [style.width.%]="fundingPercentage">
              {{ fundingPercentage }}%
            </div>
          </div>
          <p class="text-sm mt-2">
            Raised: <strong>{{ startup.fundsRaised | currency }}</strong> /
            Goal: <strong>{{ startup.fundingGoal | currency }}</strong>
          </p>
        </div>

        

        <button (click)="sendProposal()" class="w-full mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          Send Proposal
        </button>
      </div>

      <div *ngIf="loading" class="text-center text-gray-500 mt-4">Loading startup details...</div>
      <div *ngIf="errorMessage" class="text-center text-red-500 mt-4">{{ errorMessage }}</div>
    </div>
  `,
})
export class StartupDetailsComponent implements OnInit {
  startup: any;
  fundingPercentage: number = 0;
  loading: boolean = false;
  errorMessage: string = '';

  // ✅ Revenue Growth Line Chart Data
  revenueChartData: ChartData<'line'> = {
    labels: ['2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: 'Revenue Growth ($)',
        data: [50000, 75000, 100000, 150000, 200000],
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.2)',
        fill: true,
      },
    ],
  };

  // ✅ Startup Growth Bar Chart Data
  growthChartData: ChartData<'bar'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'User Growth',
        data: [200, 400, 600, 800, 1000],
        backgroundColor: 'green',
      },
    ],
  };

  // ✅ Chart Options
  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Growth Analytics',
      },
    },
  };

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.loadDummyData();
  }

  loadDummyData() {
    this.loading = true;

    setTimeout(() => {
      this.startup = {
        name: 'EcoTech Solutions',
        category: 'Green Energy',
        description: 'A startup focused on developing sustainable and renewable energy solutions.',
        fundsRaised: 50000,
        fundingGoal: 100000,
      };
      this.fundingPercentage = Math.round((this.startup.fundsRaised / this.startup.fundingGoal) * 100);
      this.loading = false;
    }, 1000);
  }

  sendProposal() {
    this.router.navigate(['/marketplace']);
  }

  goBack() {
    this.router.navigate(['/marketplace']);
  }
}
