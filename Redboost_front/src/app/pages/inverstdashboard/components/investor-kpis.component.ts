import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-investor-kpis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Total Investments -->
      <div class="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105">
        <div class="text-[#0A4955] text-lg font-semibold">Investissements Totaux</div>
        <div class="text-[#DB1E37] text-3xl font-bold mt-2">€{{ animatedValues[0] }}</div>
        <div class="text-[#6B7280] text-sm mt-1">+12% vs dernier trimestre</div>
      </div>

      <!-- ROI -->
      <div class="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105">
        <div class="text-[#0A4955] text-lg font-semibold">Retour sur Investissement (ROI)</div>
        <div class="text-[#DB1E37] text-3xl font-bold mt-2">{{ animatedValues[1] }}%</div>
        <div class="text-[#6B7280] text-sm mt-1">+3.2% vs dernier trimestre</div>
      </div>

      <!-- Active Investments -->
      <div class="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105">
        <div class="text-[#0A4955] text-lg font-semibold">Investissements Actifs</div>
        <div class="text-[#DB1E37] text-3xl font-bold mt-2">{{ animatedValues[2] }}</div>
        <div class="text-[#6B7280] text-sm mt-1">+2 vs dernier trimestre</div>
      </div>
    </div>
  `,
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition(':enter', [
        animate('0.5s {{delay}}ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { params: { delay: 0 } })
    ])
  ]
})
export class InvestorKpisComponent implements OnInit {
  animatedValues: number[] = [0, 0, 0]; // Initialize with zeros for each KPI

  // Target values for each KPI
  targetValues = [1250000, 18.5, 14];

  ngOnInit() {
    this.animateValues();
  }

  animateValues() {
    this.targetValues.forEach((target, index) => {
      const duration = 2000; // Animation duration in milliseconds
      const increment = target / (duration / 16); // Increment for the KPI value

      let currentValue = 0;

      const updateAnimation = () => {
        currentValue += increment;
        if (currentValue >= target) {
          currentValue = target;
        }

        this.animatedValues[index] = Math.round(currentValue);

        if (currentValue < target) {
          requestAnimationFrame(updateAnimation);
        }
      };

      requestAnimationFrame(updateAnimation);
    });
  }
}