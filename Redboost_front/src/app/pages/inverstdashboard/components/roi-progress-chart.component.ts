import { Component } from '@angular/core';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-roi-progress-chart',
  standalone: true,
  imports: [ChartModule],
  template: `
    <div class="p-6 bg-white rounded-2xl shadow-lg">
      <div class="text-[#0A4955] text-xl font-bold mb-6">Progrès du ROI et Investissements Mensuels</div>
      <p-chart type="bar" [data]="chartData" [options]="chartOptions" class="h-80" />
    </div>
  `,
})
export class RoiProgressChartComponent {
  chartData: any;
  chartOptions: any;

  ngOnInit() {
    this.initChart();
  }

  initChart() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const roiData = [5, 7, 10, 12, 15, 18, 20, 22, 18, 15, 12, 10]; // Example ROI data (%)
    const investmentData = [50000, 75000, 100000, 120000, 150000, 180000, 200000, 220000, 180000, 150000, 120000, 100000]; // Example investment data (€)

    this.chartData = {
      labels: months,
      datasets: [
        {
          label: 'ROI (%)',
          data: roiData,
          backgroundColor: 'rgba(219, 30, 55, 0.8)', // Red with transparency
          borderColor: '#DB1E37',
          borderWidth: 1,
          borderRadius: 10, // Rounded bars
          hoverBackgroundColor: 'rgba(219, 30, 55, 1)', // Solid red on hover
          yAxisID: 'y',
        },
        {
          label: 'Investissements (€)',
          data: investmentData,
          backgroundColor: 'rgba(10, 73, 85, 0.8)', // Blue with transparency
          borderColor: '#0A4955',
          borderWidth: 1,
          borderRadius: 10, // Rounded bars
          hoverBackgroundColor: 'rgba(10, 73, 85, 1)', // Solid blue on hover
          yAxisID: 'y1',
        },
      ],
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1500, // Animation duration in milliseconds
        easing: 'easeInOutQuad', // Smooth easing function
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        x: {
          stacked: false, // Bars are not stacked
          grid: {
            display: false,
          },
          ticks: {
            color: '#0A4955',
          },
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'ROI (%)',
            color: '#DB1E37',
          },
          ticks: {
            color: '#DB1E37',
          },
          grid: {
            color: '#DB1E3720', // Light red grid lines
          },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Investissements (€)',
            color: '#0A4955',
          },
          ticks: {
            color: '#0A4955',
          },
          grid: {
            drawOnChartArea: false, // No grid lines for the right axis
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: '#0A4955',
            usePointStyle: true, // Use point style for legend
          },
        },
        tooltip: {
          backgroundColor: '#0A4955',
          titleColor: '#FFFFFF',
          bodyColor: '#FFFFFF',
          borderColor: '#DB1E37',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            label: (context: any) => {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.dataset.label === 'ROI (%)' ? `${context.parsed.y}%` : `€${context.parsed.y.toLocaleString()}`;
              }
              return label;
            },
          },
        },
      },
    };
  }
}