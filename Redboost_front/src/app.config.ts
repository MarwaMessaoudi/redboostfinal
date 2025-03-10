import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'; 
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { provideNativeDateAdapter } from '@angular/material/core'; // Import this!
import { MessageService } from 'primeng/api'; // Import MessageService
import { AuthInterceptor } from './app/pages/auth/AuthInterceptor'; // Import AuthInterceptor
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from './environment';

console.log('Initializing Firebase with config:', environment.firebaseConfig);

import { ToastrModule } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
    providers: [
        MessageService, // Provide MessageService
        provideRouter(
            appRoutes,
            withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
            withEnabledBlockingInitialNavigation()
        ),
        provideFirebaseApp(() => initializeApp(environment.firebaseConfig)), // Initialize Firebase
        provideAuth(() => getAuth()), // Initialize Firebase Auth
        provideHttpClient(
            withFetch(),
            withInterceptors([AuthInterceptor]) // Add AuthInterceptor
        ),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: 'aura', options: { darkModeSelector: '.app-dark' } } }),
        provideNativeDateAdapter(), // ✅ Fixed missing comma
        importProvidersFrom(ToastrModule.forRoot()) // ✅ Import ToastrModule properly
    ]
};
