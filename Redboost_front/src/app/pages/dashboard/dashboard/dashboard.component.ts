import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ProjetService } from '../../frontoffice/service/projet-service.service';
import { AuthService } from '../../frontoffice/service/auth.service';
import { DashboardStatistics } from '../../../models/statistics';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  statistics: DashboardStatistics | null = null;
  userId: number | null = null;
  errorMessage: string | null = null;

  // Bar Chart Configuration
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      x: { 
        grid: { display: false },
        ticks: { display: false }
      },
      y: { 
        beginAtZero: true, 
        max: 100, 
        title: { display: true, text: 'Pourcentage', color: '#0A4955', font: { size: 12 } },
        grid: {
          color: '#e2e8f0',
          drawTicks: false,
          borderDash: [3, 3]
        } as any,
        ticks: { stepSize: 20, color: '#0A4955', font: { size: 10 } }
      }
    },
    plugins: { 
      legend: { 
        display: true, 
        position: 'top', 
        align: 'start',
        labels: { 
          font: { size: 12, weight: 'bold' },
          color: '#0A4955',
          boxWidth: 10,
          usePointStyle: true,
          padding: 12
        } 
      },
      tooltip: { 
        backgroundColor: '#0A4955', 
        cornerRadius: 6, 
        bodyFont: { size: 12 },
        titleFont: { size: 14, weight: 'bold' }
      }
    },
    elements: {
      bar: {
        borderWidth: 1,
        borderRadius: 4,
      }
    },
    animation: false // Disable animations to prevent shaking
  };
  public barChartType: 'bar' = 'bar';
  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };

  // Pie Chart Configuration
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    cutout: '15%',
    plugins: { 
      legend: { 
        position: 'bottom',
        labels: { 
          font: { size: 12, weight: 'bold' },
          color: '#0A4955',
          padding: 16,
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels && data.datasets.length) {
              return data.labels.map((label, i) => {
                const meta = chart.getDatasetMeta(0);
                const style = meta.controller.getStyle(i, false);
                return {
                  text: `${label}`,
                  fillStyle: style['backgroundColor'],
                  strokeStyle: style['borderColor'],
                  lineWidth: style['borderWidth'],
                  pointStyle: 'circle',
                  hidden: !chart.getDataVisibility(i),
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: { 
        backgroundColor: '#0A4955', 
        cornerRadius: 6, 
        bodyFont: { size: 12 },
        titleFont: { size: 14, weight: 'bold' }
      }
    },
    elements: {
      arc: {
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverBorderWidth: 4,
        hoverOffset: 8
      }
    },
    animation: false // Already disabled, kept for clarity
  };
  public pieChartType: 'pie' = 'pie';
  public pieChartData: ChartData<'pie'> = { labels: [], datasets: [] };

  constructor(
    private statisticsService: ProjetService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user && user.id) {
          this.userId = user.id;
          this.loadStatistics();
        } else {
          this.errorMessage = 'No authenticated user found. Please log in.';
        }
      },
      error: (err) => {
        console.error('Error fetching current user:', err);
        this.errorMessage = 'Failed to load user data. Please try again.';
      }
    });
  }

  loadStatistics(): void {
    if (!this.userId) {
      this.errorMessage = 'User ID not available.';
      return;
    }

    this.statisticsService.getCoachDashboardStatistics(this.userId).subscribe({
      next: (data) => {
        this.statistics = data;
        this.setupCharts();
      },
      error: (err) => {
        console.error('Error fetching statistics:', err);
        this.errorMessage = 'Failed to load dashboard data.';
      }
    });
  }

  setupCharts(): void {
    if (!this.statistics) return;

    // Bar Chart: Phase Completion Percentages
    this.barChartData = {
      labels: this.statistics.phases.map(phase => `${phase.projectName} - ${phase.phaseName}`),
      datasets: [
        {
          data: this.statistics.phases.map(phase => phase.completionPercentage),
          label: 'Completion %',
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: '#4BC0C0',
          borderWidth: 1,
          barThickness: 12,
          borderRadius: 4,
          hoverBackgroundColor: '#4BC0C0',
          hoverBorderColor: '#3a9a9a'
        }
      ]
    };

    // Pie Chart: Project Statistics Breakdown
    this.pieChartData = {
      labels: ['Projets Actifs', 'Prêt pour Révision', 'Projets Terminés'],
      datasets: [
        {
          data: [
            this.statistics.projects.activeProjects,
            this.statistics.projects.reviewReadyProjects,
            this.statistics.projects.totalProjects - this.statistics.projects.activeProjects
          ],
          backgroundColor: ['#0A4955', '#DB1E37', '#4BC0C0'],
          borderColor: ['#0A4955', '#DB1E37', '#4BC0C0'],
          borderWidth: 3,
          hoverBackgroundColor: ['#083c44', '#b5182d', '#3a9a9a'],
          hoverBorderColor: ['#083c44', '#b5182d', '#3a9a9a']
        }
      ]
    };
  }
}