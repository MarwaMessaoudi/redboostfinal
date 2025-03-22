import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { TopbarWidget } from './components/topbarwidget.component';
import { HeroWidget } from './components/herowidget';
import { FeaturesWidget } from './components/featureswidget';
import { HighlightsWidget } from './components/highlightswidget';
import { PricingWidget } from './components/pricingwidget';
import { FooterWidget } from './components/footerwidget';
import { RoadmapWidget } from './components/roadmap';
import { CommonModule } from '@angular/common';
import {TestimonialsWidget } from './components/testimonials';
import { ContactInfoComponent } from './components/contact-info.component';
import { BecomeACoachComponent } from './components/become-a-coach';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [RouterModule, ContactInfoComponent , TopbarWidget, HeroWidget, FeaturesWidget, HighlightsWidget, PricingWidget, FooterWidget, RippleModule, StyleClassModule, ButtonModule, DividerModule, RoadmapWidget , TimelineModule, CardModule, CommonModule, TestimonialsWidget,BecomeACoachComponent],
    template: `
        <div class="bg-surface-0 dark:bg-surface-900">
            <div id="home" class="landing-wrapper overflow-hidden">
                <contact-info />
                <!-- Topbar - Responsif -->
                <topbar-widget class="py-4 px-4 md:py-6 md:px-6 lg:mx-2 lg:px-8 xl:mx-4  flex items-center justify-between relative lg:static" />

                <!-- Hero -  Vous devrez adapter HeroWidget -->
                <hero-widget />

                <!-- Features - Vous devrez adapter FeaturesWidget -->
                <features-widget />

                <!-- Highlights - Vous devrez adapter HighlightsWidget -->
                <highlights-widget />
                <app-become-a-coach/>

                <!-- Roadmap - Vous devrez adapter RoadmapWidget -->
                <roadmap-widget />

                <!-- Pricing - Vous devrez adapter PricingWidget -->
                <pricing-widget />

                <!-- Testimonials - Vous devrez adapter TestimonialsWidget -->
                <testimonials-widget/>

                <!-- Footer - Responsif -->
                <footer-widget />
            </div>
        </div>
    `
})
export class Landing {}