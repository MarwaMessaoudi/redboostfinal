import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  standalone: true,
  selector: 'app-kpi-cards',
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8 bg-gray-50">
      <div *ngFor="let kpi of kpis; let i = index" class="card p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105" [@fadeIn]="getAnimationState(i)">
        <div class="flex flex-col items-center text-center h-full">
          <!-- Circular Progress Bar -->
          <div class="relative w-24 h-24 mb-6">
            <svg class="absolute top-0 left-0 w-full h-full" viewBox="0 0 36 36" [@rotate]="getAnimationState(i)">
              <!-- Background Circle -->
              <path class="text-gray-200" stroke="currentColor" stroke-width="2" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <!-- Animated Progress Circle -->
              <path class="text-[#DB1E37]" stroke="currentColor" stroke-width="2" stroke-dasharray="100, 100" [attr.stroke-dashoffset]="animatedOffsets[i]" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            </svg>
            <!-- KPI Value Text -->
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#0A4955] text-2xl font-bold">
              {{ animatedValues[i] || '0' }}{{ getUnit(kpi.value) }}
            </div>
          </div>
          <!-- KPI Title and Description -->
          <div class="text-[#0A4955] font-bold text-xl mb-2">{{ kpi.title }}</div>
          <div class="text-gray-600 text-sm flex-grow">{{ kpi.description }}</div>
        </div>
      </div>
    </div>
  `,
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition(':enter', [
        animate('0.5s {{delay}}ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { params: { delay: 0 } })
    ]),
    trigger('rotate', [
      state('void', style({ transform: 'rotate(0deg)' })),
      transition(':enter', [
        animate('2s ease-in-out', style({ transform: 'rotate(360deg)' }))
      ])
    ])
  ]
})
export class KpiCardsComponent implements OnInit {
  @Input() kpis: any[] = []; // Input property for receiving data from parent
  animatedValues: number[] = [];
  animatedOffsets: number[] = [];

  ngOnInit() {
    // Only animate if we have data
    if (this.kpis && this.kpis.length > 0) {
      this.animateValuesAndProgress();
    }
  }

  ngOnChanges() {
    // Re-animate if input data changes
    if (this.kpis && this.kpis.length > 0) {
      this.animatedValues = [];
      this.animatedOffsets = [];
      this.animateValuesAndProgress();
    }
  }

  animateValuesAndProgress() {
    this.kpis.forEach((kpi, index) => {
      const targetValue = parseFloat(kpi.value);
      const targetProgress = kpi.progress;
      const duration = 2000;
      const incrementValue = targetValue / (duration / 16);
      const incrementOffset = 100 / (duration / 16);

      let currentValue = 0;
      let currentOffset = 100;

      const updateAnimation = () => {
        currentValue += incrementValue;
        if (currentValue >= targetValue) {
          currentValue = targetValue;
        }

        currentOffset -= incrementOffset;
        if (currentOffset <= (100 - targetProgress)) {
          currentOffset = 100 - targetProgress;
        }

        this.animatedValues[index] = Math.round(currentValue);
        this.animatedOffsets[index] = currentOffset;

        if (currentValue < targetValue || currentOffset > (100 - targetProgress)) {
          requestAnimationFrame(updateAnimation);
        }
      };

      requestAnimationFrame(updateAnimation);
    });
  }

  getUnit(value: string): string {
    return value.replace(/[0-9.]/g, '');
  }

  getAnimationState(index: number) {
    return { value: true, params: { delay: index * 150 } };
  }
}