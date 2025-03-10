import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { trigger, transition, style, animate, state, keyframes } from '@angular/animations'; // Ajout de 'keyframes'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faRocket, faUsers, faNetworkWired } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'roadmap-widget',
    standalone: true,
    imports: [CommonModule, DividerModule, ButtonModule, RippleModule, TimelineModule, CardModule, FontAwesomeModule],
    template: `
        <section class="roadmap-section">
            <div class="roadmap-container">
                <div class="roadmap-header text-center mb-80">
                    <span class="section-subtitle">Phased Growth Approach</span>
                    <h2 class="section-title">A Roadmap to RedBoost Success</h2>
                    <p class="section-description">Our strategic approach to building a comprehensive platform for your success</p>
                </div>

                <div class="timeline">
                    <div class="timeline-line"></div>
                    <div class="timeline-items">
                        <div *ngFor="let event of events; let i = index" 
                             class="timeline-item {{ event.status }}" 
                             [style]="{ '--item-index': i }">
                            <div class="timeline-icon">
                                <fa-icon [icon]="event.icon" size="2x" class="text-[#004D4D]"></fa-icon>
                            </div>
                            <div class="timeline-content">
                                <div class="phase-badge">
                                    <span class="phase-number">{{ event.phase }}</span>
                                    <span class="phase-date">{{ event.date }}</span>
                                </div>
                                <h3 class="phase-title">{{ event.title }}</h3>
                                <p class="phase-description">{{ event.description }}</p>
                            </div>
                            <div class="timeline-dot"></div>
                        </div>
                    </div>
                </div>

                <div class="roadmap-cta text-center mt-60">
                    <button class="learn-more-button">
                        Learn More About Our Vision
                        <span class="button-arrow">→</span>
                    </button>
                </div>
            </div>
        </section>
    `,
    animations: [
        trigger('fadeInUp', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('0.6s ease forwards', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ]),
        trigger('pulse', [
            transition(':enter', [
                style({ boxShadow: '0 0 0 0 rgba(203, 74, 89, 0.4)' }),
                animate('2s infinite', keyframes([
                    style({ boxShadow: '0 0 0 0 rgba(203, 74, 89, 0.4)' }),
                    style({ boxShadow: '0 0 0 10px rgba(203, 74, 89, 0)' }),
                    style({ boxShadow: '0 0 0 0 rgba(203, 74, 89, 0)' })
                ]))
            ])
        ])
    ],
    styles: [`
        .roadmap-section {
            padding: 120px 0;
            background: #fafbff;
            position: relative;
            overflow: hidden;
        }

        .roadmap-container {
            max-width: 1200px;
            width: 90%;
            margin: 0 auto;
            position: relative;
        }

        .roadmap-header {
            text-align: center;
            margin-bottom: 80px;
        }

        .section-subtitle {
            display: inline-block;
            padding: 0.5rem 1.5rem;
            background: rgba(203, 74, 89, 0.1);
            color: #004D4D;
            border-radius: 30px;
            font-size: 1rem;
            font-weight: 500;
            margin-bottom: 1.5rem;
        }

        .section-title {
            font-size: clamp(2.5rem, 5vw, 3.5rem);
            color: #004D4D;
            margin-bottom: 1.5rem;
            font-weight: 800;
            line-height: 1.2;
            letter-spacing: -0.02em;
        }

        .section-description {
            font-size: 1.1rem;
            color: #666;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
        }

        .timeline {
            position: relative;
            padding: 40px 0;
            margin: 60px 0;
        }

        .timeline-line {
            position: absolute;
            left: 50%;
            top: 0;
            bottom: 0;
            width: 2px;
            background: linear-gradient(to bottom, rgba(0, 77, 77, 0.3), rgba(203, 74, 89, 0.1));
            transform: translateX(-50%);
        }

        .timeline-items {
            position: relative;
        }

        .timeline-item {
            display: flex;
            align-items: center;
            margin-bottom: 100px;
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.6s ease forwards;
            animation-delay: calc(var(--item-index) * 0.2s);
        }

        .timeline-item:last-child {
            margin-bottom: 0;
        }

        .timeline-item:nth-child(odd) {
            flex-direction: row-reverse;
        }

        .timeline-item:nth-child(odd) .timeline-content {
            margin-right: 60px;
            text-align: right;
        }

        .timeline-item:nth-child(even) .timeline-content {
            margin-left: 60px;
            text-align: left;
        }

        .timeline-icon {
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 30px rgba(0, 77, 77, 0.15);
            z-index: 2;
            position: relative;
            border: 2px solid #E0E7FF;
        }

        .timeline-icon fa-icon {
            width: 32px;
            height: 32px;
            color: #004D4D;
        }

        .timeline-content {
            flex: 1;
            max-width: 400px;
            background: #fff;
            padding: 1rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .phase-badge {
            display: inline-flex;
            align-items: center;
            gap: 1rem;
            background: #fff;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
            margin-bottom: 1rem;
        }

        .phase-number {
            font-weight: 700;
            color: #CB4A59;
        }

        .phase-date {
            color: #666;
            font-size: 0.9rem;
        }

        .phase-title {
            font-size: 1.5rem;
            color: #1a1a1a;
            margin-bottom: 0.5rem;
            font-weight: 700;
        }

        .phase-description {
            color: #666;
            line-height: 1.6;
            margin: 0;
        }

        .timeline-dot {
            width: 16px;
            height: 16px;
            background: #CB4A59;
            border-radius: 50%;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1;
            border: 4px solid #fafbff;
        }

        .timeline-item.completed .timeline-dot {
            background: #CB4A59;
        }

        .timeline-item.current .timeline-dot {
            background: #CB4A59;
            box-shadow: 0 0 0 6px rgba(203, 74, 89, 0.2);
            animation: pulse 2s infinite;
        }

        .timeline-item.upcoming .timeline-dot {
            background: #E0E7FF;
            border: 2px solid #004D4D;
        }

        .roadmap-cta {
            text-align: center;
            margin-top: 60px;
        }

        .learn-more-button {
            padding: 1rem 2rem;
            background: linear-gradient(to right, #034A55, #C8223A);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 10px 20px rgba(203, 74, 89, 0.15);
        }

        .learn-more-button:hover {
            background: linear-gradient(to left, #034A55, #C8223A);
            transform: translateY(-2px);
            box-shadow: 0 15px 25px rgba(0, 77, 77, 0.2);
        }

        .button-arrow {
            transition: transform 0.3s ease;
        }

        .learn-more-button:hover .button-arrow {
            transform: translateX(4px);
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(203, 74, 89, 0.4);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(203, 74, 89, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(203, 74, 89, 0);
            }
        }

        @media (max-width: 768px) {
            .roadmap-section {
                padding: 80px 0;
            }

            .timeline-line {
                left: 40px;
            }

            .timeline-item {
                flex-direction: row !important;
                margin-bottom: 60px;
            }

            .timeline-item:nth-child(odd) .timeline-content,
            .timeline-item:nth-child(even) .timeline-content {
                margin-left: 40px;
                margin-right: 0;
                text-align: left;
            }

            .timeline-dot {
                left: 40px;
            }

            .timeline-icon {
                width: 60px;
                height: 60px;
                position: absolute;
                left: 10px;
            }

            .timeline-icon fa-icon {
                width: 24px;
                height: 24px;
            }

            .timeline-content {
                margin-left: 80px !important;
            }

            .phase-title {
                font-size: 1.3rem;
            }
        }
    `]
})
export class RoadmapWidget implements OnInit {
    events = [
        {
            status: 'completed',
            date: 'Launch: July 2024',
            icon: faRocket,
            phase: 'Phase 1',
            title: 'Platform Launch',
            description: 'Internal platform for program management and tracking'
        },
        {
            status: 'current',
            date: 'Q4 2024',
            icon: faUsers,
            phase: 'Phase 2',
            title: 'Expansion',
            description: 'Open access for entrepreneurs, investors, and partners'
        },
        {
            status: 'upcoming',
            date: 'Q1 2025',
            icon: faNetworkWired,
            phase: 'Phase 3',
            title: 'Integration',
            description: 'Integrate with external systems and expand networking features'
        }
    ];

    ngOnInit() {
        // Pas besoin de startAutoRotation ici, car c'est une timeline statique
    }
}