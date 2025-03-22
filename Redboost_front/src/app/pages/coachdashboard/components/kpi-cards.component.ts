import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  standalone: true, // Mark as standalone
  selector: 'app-kpi-cards',
  imports: [CommonModule], // Import CommonModule
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
  kpis = [
    { title: 'Startups Actives', value: '12', description: 'Nombre total de startups actives', progress: 100 },
    { title: 'Taux de Satisfaction', value: '85%', description: 'Taux de satisfaction des entrepreneurs', progress: 85 },
    { title: 'Taux de Réussite', value: '72%', description: 'Taux de réussite des startups', progress: 72 }
  ];

  animatedValues: number[] = []; // Stores the animated KPI values
  animatedOffsets: number[] = []; // Stores the animated stroke-dashoffset values for the progress circle

  ngOnInit() {
    this.animateValuesAndProgress();
  }

  // Function to animate both KPI values and progress circles
  animateValuesAndProgress() {
    this.kpis.forEach((kpi, index) => {
      const targetValue = parseFloat(kpi.value); // Numeric part of the KPI value
      const targetProgress = kpi.progress; // Target progress (0-100)
      const duration = 2000; // Animation duration in milliseconds
      const incrementValue = targetValue / (duration / 16); // Increment for the KPI value
      const incrementOffset = 100 / (duration / 16); // Increment for the stroke-dashoffset (starts at 100, goes to 100 - progress)

      let currentValue = 0;
      let currentOffset = 100; // Start fully offset (no progress visible)

      const updateAnimation = () => {
        // Animate KPI value
        currentValue += incrementValue;
        if (currentValue >= targetValue) {
          currentValue = targetValue;
        }

        // Animate progress circle
        currentOffset -= incrementOffset;
        if (currentOffset <= (100 - targetProgress)) {
          currentOffset = 100 - targetProgress; // Stop at the target progress
        }

        // Update arrays with current values
        this.animatedValues[index] = Math.round(currentValue);
        this.animatedOffsets[index] = currentOffset;

        // Continue animation if not finished
        if (currentValue < targetValue || currentOffset > (100 - targetProgress)) {
          requestAnimationFrame(updateAnimation);
        }
      };

      requestAnimationFrame(updateAnimation);
    });
  }

  // Function to extract the unit (e.g., '%', 'h', '$')
  getUnit(value: string): string {
    return value.replace(/[0-9.]/g, ''); // Remove numbers and keep the unit
  }

  getAnimationState(index: number) {
    return { value: true, params: { delay: index * 150 } };
  }
}