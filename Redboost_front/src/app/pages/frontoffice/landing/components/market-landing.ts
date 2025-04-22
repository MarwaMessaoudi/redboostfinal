import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-market-landing',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <section #marketSection id="marketlanding" class="py-16 md:py-24 px-4 bg-gray-100/20">
      <div class="max-w-7xl mx-auto">
        <div class="text-center mb-16 section-content">
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Choose your <span class="text-red-600">plan</span>
          </h2>
          <p class="text-lg text-gray-500 max-w-2xl mx-auto">
            Select the perfect plan for your needs. All plans include a 14-day trial period.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 section-content">
          <div 
            *ngFor="let plan of plans; let i = index"
            class="relative group hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden"
            [ngClass]="{
              'bg-[#0A4955] border-0 shadow-lg': plan.highlighted,
              'bg-white border border-gray-200 shadow-md': !plan.highlighted
            }"
          >
            <div class="p-8" [ngClass]="{'text-white': plan.highlighted, 'text-gray-800': !plan.highlighted}">
              <div class="mb-6">
                <ng-container [ngSwitch]="plan.title">
                  <span *ngSwitchCase="'Basic'" class="pi pi-bolt" [style]="{ fontSize: '36px', color: plan.highlighted ? 'white' : '#0A4955' }"></span>
                  <span *ngSwitchCase="'Professional'" class="pi pi-shield" [style]="{ fontSize: '36px', color: plan.highlighted ? 'white' : '#0A4955' }"></span>
                  <span *ngSwitchCase="'Enterprise'" class="pi pi-users" [style]="{ fontSize: '36px', color: plan.highlighted ? 'white' : '#0A4955' }"></span>
                </ng-container>
              </div>
              <h3 class="text-xl font-bold mb-3">{{ plan.title }}</h3>
              <p class="text-sm mb-6" [ngClass]="{'text-white/90': plan.highlighted, 'text-gray-500': !plan.highlighted}">{{ plan.description }}</p>
              
              <div class="mb-6">
                <div class="text-3xl font-bold">{{ plan.price }}</div>
                <div *ngIf="plan.price !== 'Custom'" class="text-sm mt-1" [ngClass]="{'text-white/70': plan.highlighted, 'text-gray-500': !plan.highlighted}">
                  per user / month
                </div>
              </div>
              
              <p-button 
                [style]="{ 'width': '100%', 'border-radius': '5px !important', 'padding': '12px 0' ,'height': '10px' }"
                class="custom-button"
                [ngClass]="{
                  'bg-white text-[#0A4955] hover:bg-gray-100': plan.highlighted,
                  'bg-[#DB1E37] hover:bg-[#DB1E37]/80 text-white': !plan.highlighted
                }"
                [label]="plan.ctaText"
              ></p-button>
            </div>
            
            <div class="border-t" [ngClass]="{'border-white/20': plan.highlighted, 'border-gray-200': !plan.highlighted}" class="p-8">
              <p class="font-medium text-sm mb-4" [ngClass]="{'text-white': plan.highlighted, 'text-gray-800': !plan.highlighted}">
                INCLUDED FEATURES:
              </p>
              <ul class="space-y-3">
                <li *ngFor="let feature of plan.features" class="flex items-start text-sm">
                  <span class="pi pi-check" [style]="{ fontSize: '16px', color: plan.highlighted ? 'white' : '#0A4955' }" class="mr-2 mt-0.5 flex-shrink-0"></span>
                  <span [ngClass]="{'text-white/90': plan.highlighted, 'text-gray-500': !plan.highlighted}">{{ feature }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="mt-20 text-center section-content">
          <div class="bg-white p-10 rounded-2xl shadow-lg max-w-3xl mx-auto">
            <span class="pi pi-clock" [style]="{ fontSize: '48px', color: '#0A4955' }" class="mx-auto mb-6 block"></span>
            <h3 class="text-2xl font-bold text-gray-800 mb-4">
              Need a custom solution?
            </h3>
            <p class="text-gray-500 mb-8">
              Our team can build a tailored package for your specific requirements.
              Let's discuss how we can help your organization succeed.
            </p>
            <p-button 
              size="large"
              [style]="{ 'border-radius': '5px !important', 'padding': '12px 0' }"
              class="custom-button bg-[#0A4955] hover:bg-[#0A4955]/80 text-white px-8"
              label="Schedule a consultation"
            ></p-button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    .pi {
      display: inline-block;
      vertical-align: middle;
    }

    .section-content {
      opacity: 0;
      transform: translateY(50px);
      transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }

    .section-content.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .custom-button {
      border-radius: 5px !important;
      height: 48px 
    }
  `]
})
export class MarketLandingComponent implements AfterViewInit {
  @ViewChild('marketSection') marketSection!: ElementRef;

  plans = [
    {
      title: 'Basic',
      price: '$29',
      description: 'Essential features for small teams and startups',
      features: [
        'Up to 5 team members',
        'Basic analytics',
        '1GB storage',
        'Email support',
        'API access'
      ],
      ctaText: 'Register',
      highlighted: false,
    },
    {
      title: 'Professional',
      price: '$79',
      description: 'Everything you need for growing businesses',
      features: [
        'Up to 20 team members',
        'Advanced analytics',
        '10GB storage',
        'Priority support',
        'API access',
        'Single sign-on',
        'Custom integrations'
      ],
      ctaText: 'Register',
      highlighted: true,
    },
    {
      title: 'Enterprise',
      price: 'Custom',
      description: 'Advanced features for large organizations',
      features: [
        'Unlimited team members',
        'Enterprise analytics',
        'Unlimited storage',
        '24/7 dedicated support',
        'Advanced API access',
        'SAML & SSO',
        'Dedicated account manager'
      ],
      ctaText: 'Contact sales',
      highlighted: false,
    }
  ];

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const contents = entry.target.querySelectorAll('.section-content');
            contents.forEach((content) => content.classList.add('visible'));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(this.marketSection.nativeElement);
  }
}