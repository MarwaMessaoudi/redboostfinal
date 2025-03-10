import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'pricing-widget',
    standalone: true,
    imports: [DividerModule, ButtonModule, RippleModule],
    template: `
        <div id="pricing" class="py-6 px-6 lg:px-20 my-2 md:my-6">
            <div class="text-center">
                <div class="text-0A4955 font-bold mb-4 text-5xl animate-fade-in">Services Que Nous Offrons</div>
                <span class="text-DB1E37 text-2xl font-light animate-fade-in">Plus Qu'une Simple Plateforme</span>
            </div>

            <div class="flex flex-col items-center">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl mt-8">
                    <!-- Web Development Card -->
                    <div class="pricing-card p-6 flex flex-col items-center border-2 border-[#0A4955] dark:border-[#DB1E37]
                              cursor-pointer hover:shadow-lg transition-all duration-300 rounded-xl
                              h-full bg-white dark:bg-gray-800">
                        <div class="icon-container mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-[#0A4955] dark:text-[#DB1E37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <h3 class="text-[#0A4955] dark:text-[#DB1E37] text-center text-2xl font-semibold mb-4">
                            Services de Développement Web
                        </h3>
                        <p class="text-gray-600 dark:text-gray-300 text-center mb-6">
                            Des sites web personnalisés et évolutifs conçus pour grandir avec vous.
                        </p>
                        <p-divider class="w-full bg-surface-200"></p-divider>
                    </div>

                    <!-- Communication and Design Card -->
                    <div class="pricing-card p-6 flex flex-col items-center border-2 border-[#0A4955] dark:border-[#DB1E37]
                              cursor-pointer hover:shadow-lg transition-all duration-300 rounded-xl
                              h-full bg-white dark:bg-gray-800">
                        <div class="icon-container mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-[#0A4955] dark:text-[#DB1E37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 class="text-[#0A4955] dark:text-[#DB1E37] text-center text-2xl font-semibold mb-4">
                            Solutions de Communication et Design
                        </h3>
                        <p class="text-gray-600 dark:text-gray-300 text-center mb-6">
                            Un contenu et des visuels captivants qui amplifient votre marque.
                        </p>
                        <p-divider class="w-full bg-surface-200"></p-divider>
                    </div>
                </div>

                <!-- Call to Action Button -->
                <div class="mt-12">
                    <button pButton pRipple label="Commencer"
                        class="p-button-rounded border-0 font-light leading-tight text-xl py-4 px-8 hover:scale-105 transition-transform duration-300"
                        style="background-color: #DB1E37; color: #FFFFFF; font-size: 1.5rem;">
                    </button>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .pricing-card {
            transition: all 0.3s ease;
            min-height: 300px;
        }

        .pricing-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .icon-container {
            transition: transform 0.3s ease;
        }

        .pricing-card:hover .icon-container {
            transform: scale(1.1);
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
            animation: fadeIn 1s ease-out;
        }
    `]
})
export class PricingWidget {}
