import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CarouselModule } from 'primeng/carousel';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
    selector: 'hero-widget',
    standalone: true,
    imports: [ButtonModule, RippleModule, CarouselModule],
    template: `
        <div id="hero" class="hero-container flex flex-col justify-center items-center min-h-screen text-white py-12 px-6 lg:px-20">
            <div class="text-center max-w-4xl relative z-10">
                <h1 class="text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">BOOST YOUR BUSINESS</h1>
                <p class="text-xl lg:text-2xl mb-8 animate-fade-in">
                    Your All-in-One Platform for Efficient Program Management, Startup Support, and Seamless Communication
                </p>
                <button type="button" class="get-started-button">
                    Get Started Today <span class="arrow"></span>
                </button>
            </div>
            <div class="background-overlay"></div>
        </div>
    `,
    animations: [
        trigger('fadeIn', [
            state('in', style({ opacity: 1 })),
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('0.8s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ])
    ],
    styles: [`
        .hero-container {
            position: relative;
            overflow: hidden;
        }

        .hero-container::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('/assets/redstart0.jpg'); /* Replace with your image path */
            background-size: cover;
            background-position: center;
            opacity:0.3;
            z-index: 0;
            /* Add Overlay */
            &::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(10, 73, 85, 0.8); /* #0A4955 with 0.8 opacity */
                z-index: 1; /* Place overlay on top of the image */
            }
        }

        .background-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            /* Modified Gradient to emphasize blue */
            background: linear-gradient(to right, rgba(10, 73, 85, 0.9), rgba(219, 30, 55, 0.5)); /* Reduced red opacity */
            opacity: 0.75;
            z-index: 1;
        }

          h1 {
             font-weight: 900; /* Changed to 900 */
             color: white; /* Changed to white */
             text-shadow: 2px 2px 4px #000000; /* Added text shadow */
         }

        .get-started-button {
            /* Basic Style */
            background: linear-gradient(to right, #DB1E37, #0A4955); /* Initial gradient: Red to Blue */
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 10px; /* Rounded corners */
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s ease; /* Smooth transition for the background */
            display: inline-flex; /* To align the arrow properly */
            align-items: center;
            gap: 8px; /* Space between text and arrow */
        }

        .get-started-button .arrow {
            font-size: 1.2em; /* Make the arrow a bit larger */
        }

        .get-started-button:hover {
            background: linear-gradient(to right, #0A4955, #DB1E37); /* Reverse gradient on hover */
        }
    `]
})
export class HeroWidget implements OnInit {
    images = [
        { src: 'src/assets/Capture-removebg-preview.png', alt: 'Image 1' },
        { src: 'src/assets/Capture.PNG', alt: 'Image 2' },
        { src: 'src/assets/Capture.PNG', alt: 'Image 3' }
    ];

    ngOnInit(): void {
        // Initialization logic, if any.
    }
}