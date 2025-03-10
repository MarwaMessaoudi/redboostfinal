import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-become-a-coach',
  standalone: true,
  imports: [ButtonModule, RippleModule],
  template: `
    <div class="become-a-coach-section">
      <div class="text-container" @fadeIn>
        <h2 class="section-title">Become a <span class="coach-highlight">Coach</span></h2>
        <p class="section-description">
          Are you a passionate coach ready to guide entrepreneurs and investors?
          Join our platform to share your expertise, gain visibility, and connect
          with a dynamic community.
        </p>
      </div>

      <div class="features-container">
        <div class="feature-card" @staggerIn *ngFor="let feature of features; let i = index">
          <div class="feature-icon-container">
            <i [class]="feature.icon + ' feature-icon'"></i>
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>

      <div class="button-container" @fadeIn>
        <button pButton pRipple label="Start Now" class="p-button-raised p-button-rounded start-now-button"></button>
      </div>
    </div>
  `,
  styles: [`
    .become-a-coach-section {
      padding: 4rem 2rem;
      text-align: center;
      font-family: 'Inter', sans-serif; /* Modern font */
      background: linear-gradient(135deg, #f9f9f9, #e0f4ff);
      border-radius: 16px;
      margin: 2rem auto;
      max-width: 1200px;
      box-shadow: 0 8px 24px rgba(0, 73, 85, 0.1);
    }

    .text-container {
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 3.5rem;
      color: #004955;
      margin-bottom: 1rem;
      font-weight: 700;
      letter-spacing: -1px;
      transition: color 0.3s ease;
    }

    .section-title:hover {
      color: #DB1E37;
    }

    .coach-highlight {
      color: #DB1E37;
      font-weight: 800;
    }

    .section-description {
      font-size: 1.25rem;
      color: #555;
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .features-container {
      display: flex;
      gap: 2rem;
      margin-bottom: 3rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .feature-card {
      background-color: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 73, 85, 0.1);
      padding: 2rem;
      text-align: center;
      width: 220px;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .feature-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, #DB1E37, #004955);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .feature-card:hover::before {
      opacity: 1;
    }

    .feature-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 8px 24px rgba(0, 73, 85, 0.2);
    }

    .feature-icon-container {
      background: linear-gradient(135deg, #004955, #DB1E37);
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      transition: transform 0.3s ease;
    }

    .feature-card:hover .feature-icon-container {
      transform: rotate(360deg);
    }

    .feature-icon {
      font-size: 2rem;
      color: #fff;
    }

    .feature-title {
      font-size: 1.25rem;
      color: #004955;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .feature-description {
      font-size: 0.95rem;
      color: #777;
      line-height: 1.5;
    }

    .button-container {
      text-align: center;
    }

    .start-now-button {
      background: linear-gradient(135deg, #DB1E37, #004955);
      color: #fff;
      font-size: 1.2rem;
      padding: 1rem 2.5rem;
      border: none;
      border-radius: 50px;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .start-now-button:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 16px rgba(219, 30, 55, 0.3);
    }
  `],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition(':enter', [
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.6s {{delay}}ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { params: { delay: 0 } })
    ])
  ]
})
export class BecomeACoachComponent {
  features = [
    { icon: 'pi pi-rocket', title: 'Instant Access', description: 'Start coaching immediately.' },
    { icon: 'pi pi-lightbulb', title: 'Share Expertise', description: 'Help others grow.' },
    { icon: 'pi pi-star', title: 'Build Network', description: 'Connect with professionals.' }
  ];

  getStaggerDelay(index: number): number {
    return index * 200; // Stagger delay for each card
  }
}
