import { Component } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
    selector: 'highlights-widget',
    template: `
        <div id="highlights" class="challenge-section py-12 mx-0 my-12 " style="background-color: #555;" [@fadeIn]="'in'">
            <div class="container mx-auto px-6 lg:px-15">
             
                <div class="grid grid-cols-12 my-20 pt-2 md:pt-20">
                    <div class="col-span-12 lg:col-span-6 my-auto flex flex-col text-center lg:text-left lg:items-start gap-4">
                        <div class="leading-none text-[#0A4955] text-5xl font-extrabold animate-fade-in">
                            Built for Startups, Designed for Efficiency
                        </div>
                        <ul class="my-8 list-none p-0 flex text-[#333] flex-col gap-2">
                            <li class="py-3 px-6 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 animate-fade-in">
                                <i class="pi pi-fw pi-check text-xl text-[#DB1E37] mr-2"></i>
                                <span class="text-xl leading-normal">Track activities, KPIs, Milestones—all in one place</span>
                            </li>
                            <li class="py-3 px-6 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 animate-fade-in">
                                <i class="pi pi-fw pi-check text-xl text-[#DB1E37] mr-2"></i>
                                <span class="text-xl leading-normal">Centralized Data Management</span>
                            </li>
                            <li class="py-3 px-6 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 animate-fade-in">
                                <i class="pi pi-fw pi-check text-xl text-[#DB1E37] mr-2"></i>
                                <span class="text-xl leading-normal">Access critical data securely, with backup and history tracking</span>
                            </li>
                            <li class="py-3 px-6 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 animate-fade-in">
                                <i class="pi pi-fw pi-check text-xl text-[#DB1E37] mr-2"></i>
                                <span class="text-xl leading-normal">Customized Interactions</span>
                            </li>
                            <li class="py-3 px-6 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 animate-fade-in">
                                <i class="pi pi-fw pi-check text-xl text-[#DB1E37] mr-2"></i>
                                <span class="text-xl leading-normal">Engage seamlessly with stakeholders, including entrepreneurs, investors, and government entities.</span>
                            </li>
                            <li class="py-3 px-6 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 animate-fade-in">
                                <i class="pi pi-fw pi-check text-xl text-[#DB1E37] mr-2"></i>
                                <span class="text-xl leading-normal">Automated Reporting</span>
                            </li>
                            <li class="py-3 px-6 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 animate-fade-in">
                                <i class="pi pi-fw pi-check text-xl text-[#DB1E37] mr-2"></i>
                                <span class="text-xl leading-normal">Save time with reports that generate themselves.</span>
                            </li>
                            <li class="py-3 px-6 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 animate-fade-in">
                                <i class="pi pi-fw pi-check text-xl text-[#DB1E37] mr-2"></i>
                                <span class="text-xl leading-normal">Secure and Scalable</span>
                            </li>
                            <li class="py-3 px-6 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 animate-fade-in">
                                <i class="pi pi-fw pi-check text-xl text-[#DB1E37] mr-2"></i>
                                <span class="text-xl leading-normal">Built on trusted technologies like React.js and Node.js for a future-proof solution.</span>
                            </li>
                        </ul>
                    </div>

                    <div class="flex justify-end order-1 sm:order-2 col-span-12 lg:col-span-6 p-0 animate-fade-in">
                        <img src="/assets/redstart1.jpg" class="custom-image w-3/4 rounded-lg transition-shadow duration-300" alt="mockup" />
                    </div>
                </div>
            </div>
        </div>
    `,
    animations: [
        trigger('fadeIn', [
            state('in', style({ opacity: 1 })),
            transition(':enter', [
                style({ opacity: 0 }),
                animate('1s ease-in')
            ])
        ])
    ],
    styles: [`
        .animate-fade-in {
            animation: fadeIn 1.5s ease-in-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .pi-check {
            transition: transform 0.3s ease-in-out;
        }

        li:hover .pi-check {
            transform: scale(1.2);
        }

        .custom-image {
           object-fit: cover;
            width: 90%;
            max-height: 400px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);  /* Example: Set a maximum height */
        }
        .challenge-section {
            min-height: 100vh;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            padding: 6rem 2rem;
            position: relative;
            overflow: hidden;
        }
    `]
})
export class HighlightsWidget {}