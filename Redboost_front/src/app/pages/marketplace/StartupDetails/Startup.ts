import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { Chart, ChartData, ChartOptions, LineController, LineElement, BarController, BarElement, PointElement, LinearScale, CategoryScale, Title } from 'chart.js';

// Register Chart.js components
Chart.register(LineController, LineElement, BarController, BarElement, PointElement, LinearScale, CategoryScale, Title);

@Component({
  selector: 'app-startup-details',
  standalone: true,
  imports: [CommonModule, NgIf],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <!-- Header -->
      <header class="bg-gradient-to-r from-[#0A4955] to-[#245C67] text-white py-8 shadow-xl">
        <div class="container mx-auto px-6 flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <img [src]="startup?.logoUrl || '/assets/default-logo.png'" alt="{{ startup?.name }} Logo" 
                 class="w-16 h-16 rounded-full border-4 border-white shadow-md" (error)="onImageError($event)">
            <h1 class="text-4xl font-extrabold">{{ startup?.name || 'Startup Portfolio' }}</h1>
          </div>
          <button (click)="goBack()" class="bg-white text-[#0A4955] px-5 py-2 rounded-full font-semibold hover:bg-[#A0CED9] transition">
            ← Back to Marketplace
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="container mx-auto px-6 py-10 max-w-6xl">
        <div *ngIf="startup; else loadingOrError" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column: Overview & Metrics -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Description Card -->
            <div class="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <h2 class="text-2xl font-bold text-[#245C67] mb-4">About {{ startup.name }}</h2>
              <p class="text-[#568086] leading-relaxed">{{ startup.description }}</p>
              <div class="mt-4 flex flex-wrap gap-4 text-sm text-[#568086]">
                <span><strong>Category:</strong> {{ startup.category }}</span>
                <span><strong>Location:</strong> {{ startup.location }}</span>
                <span><strong>Founded:</strong> {{ startup.foundedYear }}</span>
                <span><strong>Founders:</strong> {{ startup.founders.join(', ') }}</span>
              </div>
            </div>

            <!-- Key Metrics -->
            <div class="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <h3 class="text-xl font-semibold text-[#245C67] mb-6">Key Metrics</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="text-center p-4 bg-[#EA7988] rounded-lg">
                  <p class="text-[#568086]">Team Size</p>
                  <p class="text-3xl font-bold text-[#0A4955]">{{ startup.teamSize }}</p>
                </div>
                <div class="text-center p-4 bg-[#A0CED9] rounded-lg">
                  <p class="text-[#568086]">Revenue</p>
                  <p class="text-3xl font-bold text-[#245C67]">{{ startup.revenue | currency:'USD':'symbol':'1.0-0' }}</p>
                </div>
                <div class="text-center p-4 bg-[#E88D9A] rounded-lg">
                  <p class="text-[#568086]">Funds Raised</p>
                  <p class="text-3xl font-bold text-[#DB1E37]">{{ startup.fundsRaised | currency:'USD':'symbol':'1.0-0' }}</p>
                </div>
                <div class="text-center p-4 bg-[#568086] rounded-lg">
                  <p class="text-[#EA7988]">Funding Goal</p>
                  <p class="text-3xl font-bold text-[#E44D62]">{{ startup.fundingGoal | currency:'USD':'symbol':'1.0-0' }}</p>
                </div>
              </div>
            </div>

            <!-- Funding Progress -->
            <div class="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <h3 class="text-xl font-semibold text-[#245C67] mb-4">Funding Progress</h3>
              <div class="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                <div class="h-8 bg-gradient-to-r from-[#0A4955] to-[#245C67] text-white text-center flex items-center justify-center font-semibold" [style.width.%]="fundingPercentage">
                  {{ fundingPercentage }}%
                </div>
              </div>
              <p class="text-sm mt-3 text-[#568086] text-center">
                <strong>{{ startup.fundsRaised | currency:'USD':'symbol':'1.0-0' }}</strong> raised of <strong>{{ startup.fundingGoal | currency:'USD':'symbol':'1.0-0' }}</strong>
              </p>
            </div>
          </div>

          <!-- Right Column: Charts & Actions -->
          <div class="space-y-8">
            <!-- Revenue Growth Chart -->
            <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 class="text-lg font-semibold text-[#245C67] mb-4">Revenue Growth</h3>
              <div class="h-64">
                <canvas #revenueChart></canvas>
              </div>
            </div>

            <!-- User Growth Chart -->
            <div class="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h3 class="text-lg font-semibold text-[#245C67] mb-4">User Growth</h3>
              <div class="h-64">
                <canvas #userGrowthChart></canvas>
              </div>
            </div>

            <!-- Action Button -->
            <button (click)="sendProposal()" class="w-full bg-gradient-to-r from-[#0A4955] to-[#245C67] text-white px-6 py-4 rounded-full font-semibold text-lg hover:from-[#245C67] hover:to-[#568086] transition">
              Send Investment Proposal
            </button>
          </div>
        </div>

        <!-- Loading/Error States -->
        <ng-template #loadingOrError>
          <div *ngIf="loading" class="text-center text-[#568086] mt-12 text-xl animate-pulse">Loading startup details...</div>
          <div *ngIf="errorMessage" class="text-center text-[#DB1E37] mt-12 text-xl">{{ errorMessage }}</div>
        </ng-template>
      </main>
    </div>
  `,
})
export class StartupDetailsComponent implements OnInit {
  startup: any = null;
  fundingPercentage: number = 0;
  loading: boolean = false;
  errorMessage: string = '';

  @ViewChild('revenueChart', { static: false }) revenueChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('userGrowthChart', { static: false }) userGrowthChartRef!: ElementRef<HTMLCanvasElement>;

  // Revenue Growth Line Chart Data
  revenueChartData: ChartData<'line'> = {
    labels: ['2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: 'Revenue ($)',
        data: [50000, 80000, 120000, 180000, 250000],
        borderColor: '#0A4955', // Changed to Dark teal
        backgroundColor: 'rgba(10, 73, 85, 0.2)', // Adjusted rgba for #0A4955
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#0A4955',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  // User Growth Bar Chart Data
  userGrowthChartData: ChartData<'bar'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Users',
        data: [300, 650, 900, 1200, 1500],
        backgroundColor: '#E44D62', // Changed to Pinkish red
        borderColor: '#E44D62',
        borderWidth: 1,
        hoverBackgroundColor: '#DB1E37', // Changed to Bright red
      },
    ],
  };

  // Chart Options
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 14, weight: 'bold' }, color: '#245C67' }, // Changed to Slate teal
      },
      tooltip: { backgroundColor: '#245C67', titleFont: { size: 14 }, bodyFont: { size: 12 } }, // Changed to Slate teal
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#568086', font: { size: 12 } }, // Changed to Muted teal
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
      x: {
        ticks: { color: '#568086', font: { size: 12 } }, // Changed to Muted teal
        grid: { display: false },
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
        description: 'EcoTech Solutions is revolutionizing the energy sector with cutting-edge solar and wind technologies, aiming to power a sustainable future and reduce global carbon emissions by 25% by 2030.',
        fundsRaised: 95000,
        fundingGoal: 200000,
        revenue: 250000,
        teamSize: 22,
        foundedYear: 2020,
        location: 'Austin, TX',
        logoUrl: '/assets/ecotech-logo.png',
        website: 'https://ecotech.com',
        founders: ['Alex Green', 'Sara Bloom'],
        technologies: ['Solar Panels', 'Wind Turbines', 'AI Optimization'],
      };
      this.fundingPercentage = Math.round((this.startup.fundsRaised / this.startup.fundingGoal) * 100);
      this.loading = false;

      // Render charts after data is loaded and DOM is updated
      setTimeout(() => this.renderCharts(), 0);
    }, 1000);
  }

  renderCharts() {
    if (this.revenueChartRef && this.revenueChartRef.nativeElement) {
      new Chart(this.revenueChartRef.nativeElement, {
        type: 'line',
        data: this.revenueChartData,
        options: this.chartOptions,
      });
    } else {
      console.error('Revenue chart canvas reference not found');
    }

    if (this.userGrowthChartRef && this.userGrowthChartRef.nativeElement) {
      new Chart(this.userGrowthChartRef.nativeElement, {
        type: 'bar',
        data: this.userGrowthChartData,
        options: this.chartOptions,
      });
    } else {
      console.error('User growth chart canvas reference not found');
    }
  }

  sendProposal() {
    this.router.navigate(['/marketplace'], { queryParams: { action: 'proposal', startup: this.startup.name } });
  }

  goBack() {
    this.router.navigate(['/marketplace']);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/default-logo.png'; // Fallback image
  }
}