import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUsers, faCog, faChartLine, faShield } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'features-widget',
    standalone: true,
    imports: [CommonModule, ButtonModule, RippleModule, FontAwesomeModule],
    template: `
        <section class="challenge-section">
            <div class="challenge-content">
                <h1 class="challenge-title">
                    The Challenge We Solve
                </h1>
                <p class="challenge-description">
                    Managing entrepreneurial programs shouldn't be a maze. At RedBoost, we know the struggles of disjointed tools, scattered data, and inefficient processes.
                </p>
                <h3 class="challenge-subtitle">
                    RedBoost is built to change that:
                </h3>
                <div class="challenge-cards">
                    <div *ngFor="let feature of features; let i = index"
                         class="challenge-card"
                         [@fadeIn]="state"
                         [style]="{ 'transition-delay': i * 0.2 + 's' }"
                         (click)="selectFeature(i)"
                         [class.selected]="isSelected(i)">
                        <div class="card-icon">
                            <fa-icon [icon]="feature.icon" size="2x"></fa-icon>
                        </div>
                        <h3>{{ feature.text }}</h3>
                    </div>
                </div>
                <button pButton pRipple label="See RedBoost in Action"
                        class="action-button"
                ></button>
            </div>
        </section>
    `,
    animations: [
        trigger('fadeIn', [
            state('in', style({ opacity: 1, transform: 'translateY(0)' })),
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('0.6s ease-out')
            ])
        ]
        )
    ],
    styles: [`
        .challenge-section {
            min-height: 100vh;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            padding: 6rem 2rem;
            position: relative;
            overflow: hidden;
        }

        .challenge-content {
            max-width: 1200px;
            margin: 0 auto;
            text-align: center;
            position: relative;
            z-index: 2;
        }

        .challenge-title {
            font-size: 3rem;
            /* Adjusted for visual match */
            font-weight: 700;
            margin-bottom: 1.5rem;
            color: #034A55;
            /* Couleur bleu-vert */
        }

        .challenge-description {
            font-size: 1.2rem;
            /* Correspond à la taille dans la capture */
            color: #555;
            /* Couleur grise */
            max-width: 800px;
            margin: 0 auto 3rem;
            line-height: 1.6;
            /* Espacement des lignes */
        }

        .challenge-subtitle {
            font-size: 1.4rem;
            color: #004D4D;
            margin-bottom: 4rem;
        }

        .challenge-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-bottom: 4rem;
        }

        .challenge-card {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(203, 74, 89, 0.1);
            cursor: pointer; /* Indicate that the card is clickable */
        }

        .challenge-card:hover {
            transform: translateY(-10px) !important;
            box-shadow: 0 20px 40px rgba(0, 77, 77, 0.15) !important;
            border: 1px solid rgba(203, 74, 89, 0.2) !important;
        }

        .challenge-card.selected {
            transform: scale(1.1); /* Enlarge the card when selected */
            box-shadow: 0 20px 40px rgba(0, 77, 77, 0.2);
        }

        .card-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #EA7988;

        }



        .challenge-card h3 {
            font-size: 1.2rem;
            color: #004D4D;
            margin-bottom: 1rem;
        }

        .action-button {
            background: linear-gradient(to right, #C8223A, #034A55);
            color: white;
            border: none;
            padding: 1rem 2.5rem;
            font-weight: bold;
            border-radius: 10px;
            font-size: 1.1rem;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .action-button:hover {
            background: linear-gradient(to right, #0A4955, #DB1E37) !important;
        }

        .button-glow {
            position: absolute;
            width: 50px;
            height: 100%;
            background: rgba(255, 255, 255, 0.3);
            transform: skewX(-20deg);
            top: 0;
            left: -100%;
            animation: buttonGlow 3s infinite;
        }

        @keyframes buttonGlow {
            0% {
                left: -100%;
            }

            100% {
                left: 200%;
            }
        }

        @media (max-width: 1024px) {
            .challenge-title {
                font-size: 3rem;
            }

            .challenge-cards {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 768px) {
            .challenge-section {
                padding: 4rem 1.5rem;
            }

            .challenge-title {
                font-size: 2.5rem;
            }

            .challenge-description {
                font-size: 1.1rem;
            }

            .challenge-cards {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }
        }

        @media (max-width: 480px) {
            .challenge-title {
                font-size: 2rem;
            }

            .challenge-description {
                font-size: 1rem;
            }

            .action-button {
                padding: 0.8rem 2rem;
                font-size: 1rem;
            }
        }
    `]
})
export class FeaturesWidget {
    features = [
        {
            icon: faUsers,
            text: "Streamline program management"
        },
        {
            icon: faCog,
            text: "Automate repetitive tasks"
        },
        {
            icon: faChartLine,
            text: "Provide real-time insights and performance tracking"
        },
        {
            icon: faShield,
            text: "Ensure secure, centralized data management"
        }
    ];

    state = 'in'; // État initial pour l'animation
    selectedFeatureIndex: number | null = null;

    selectFeature(index: number) {
        this.selectedFeatureIndex = index === this.selectedFeatureIndex ? null : index;  // Toggle selection
    }

    isSelected(index: number): boolean {
        return this.selectedFeatureIndex === index;
    }
}