import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '../../../layout/service/layout.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    standalone: true,
    selector: 'app-revenue-stream-widget',
    imports: [ChartModule],
    template: `
        <div class="card !mb-8 relative overflow-hidden" [@fadeIn]>
            <!-- Title with a touch of #DB1E37 -->
            <div class="font-semibold text-xl mb-4 text-[#0A4955]">
                Startup <span class="text-[#DB1E37]">Revenue</span> Over Time
            </div>
            <p-chart type="line" [data]="chartData" [options]="chartOptions" class="h-80" />
        </div>
    `,
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ])
    ]
})
export class RevenueStreamWidget implements OnInit, OnDestroy {
    chartData: any;
    chartOptions: any;
    subscription!: Subscription;

    constructor(public layoutService: LayoutService) {
        this.subscription = this.layoutService.configUpdate$
            .pipe(debounceTime(25))
            .subscribe(() => {
                this.initChart();
            });
    }

    ngOnInit() {
        this.initChart();
    }

    initChart() {
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
        const data = [5000, 15000, 10000, 25000, 20000, 30000, 35000];

        // Initialize the chart with empty data
        this.chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Revenue (in USD)',
                    borderColor: '#0A4955',
                    backgroundColor: 'rgba(10, 73, 85, 0.1)',
                    data: new Array(data.length).fill(null), // Start with null values
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#0A4955',
                    pointBorderColor: '#FFFFFF',
                    pointBorderWidth: 2
                }
            ]
        };

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            responsive: true,
            animation: {
                duration: 2000, // Increase animation duration for a smoother effect
                easing: 'easeOutQuart',
                onProgress: (animation: any) => {
                    // Gradually reveal the line and points
                    const chart = animation.chart;
                    const ctx = chart.ctx;
                    const meta = chart.getDatasetMeta(0);

                    if (meta.data.length > 0) {
                        const lastPoint = meta.data[meta.data.length - 1];
                        const x = lastPoint.x;
                        const y = lastPoint.y;

                        // Draw a gradient or mask to simulate the line drawing itself
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(meta.data[0].x, meta.data[0].y);
                        for (let i = 1; i < meta.data.length; i++) {
                            ctx.lineTo(meta.data[i].x, meta.data[i].y);
                        }
                        ctx.strokeStyle = '#0A4955';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        ctx.restore();
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: '#0A4955',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    borderColor: '#DB1E37',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                        label: (context: any) => {
                            const value = context.raw;
                            return `Revenue: $${value}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#0A4955',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#0A4955',
                        font: {
                            size: 12
                        },
                        callback: (value: any) => `$${value}`
                    },
                    grid: {
                        color: '#DB1E3720',
                        drawBorder: false
                    }
                }
            },
            hover: {
                mode: 'nearest',
                intersect: true,
                animationDuration: 200
            }
        };

        // Simulate dynamic data loading
        setTimeout(() => {
            this.chartData.datasets[0].data = data; // Update the data after a delay
            this.chartData = { ...this.chartData }; // Trigger change detection
        }, 500);
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}