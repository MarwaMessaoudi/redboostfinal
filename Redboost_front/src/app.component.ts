import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthService } from './app/pages/frontoffice/service/auth.service';
import { UserService } from './app/pages/frontoffice/service/UserService';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterModule, RouterOutlet],
    template: ` <router-outlet></router-outlet> `,
    styleUrls: ['./app.component.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent implements OnInit {
    private publicRoutes = ['/signin', '/signup', '/forgot-password', '/reset-password', '/confirm-email', ''];

    constructor(
        private authService: AuthService,
        private router: Router,
        private userService: UserService,
        private http: HttpClient
    ) {}

    ngOnInit() {
        const currentUrl = this.router.url.split('?')[0]; // Ignore query params

        // Check if the current route is public
        const isPublicRoute = this.publicRoutes.includes(currentUrl);

        // Skip authentication check for public routes
        if (isPublicRoute) {
            console.log('Public route detected, skipping auth check');
            return;
        }

        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        // If no tokens are present, handle unauthenticated state
        if (!accessToken && !refreshToken) {
            console.log('No tokens found, redirecting to landing page');
            this.handleAuthFailure();
            return;
        }

        // If both tokens are present, verify the access token
        if (accessToken && refreshToken) {
            this.authService.verifyToken().subscribe({
                next: (response) => {
                    console.log('Token verification successful:', response);
                    this.fetchUserProfile();
                },
                error: (error) => {
                    console.error('Token verification failed:', error);
                    // Attempt to refresh the token if verification fails
                    this.attemptTokenRefresh();
                }
            });
        } else {
            // If only one token is missing, attempt to refresh
            this.attemptTokenRefresh();
        }
    }

    private attemptTokenRefresh() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            console.log('No refresh token available, handling auth failure');
            this.handleAuthFailure();
            return;
        }

        this.authService.refreshToken().subscribe({
            next: (response: any) => {
                console.log('Token refresh successful:', response);
                localStorage.setItem('accessToken', response.accessToken);
                localStorage.setItem('refreshToken', response.refreshToken);
                this.fetchUserProfile();
            },
            error: (error) => {
                console.error('Token refresh failed:', error);
                this.handleAuthFailure();
            }
        });
    }

    private handleAuthFailure() {
        this.clearTokens();
        this.userService.setUser(null);
        this.router.navigate(['']); // Redirect to landing page for protected routes
    }

    private fetchUserProfile() {
        this.http
            .get('http://localhost:8085/users/profile', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            })
            .subscribe({
                next: (response: any) => {
                    console.log('User profile fetched successfully:', response);
                    this.userService.setUser(response);
                },
                error: (error) => {
                    console.error('Failed to fetch user profile:', error);
                    this.userService.setUser(null);
                }
            });
    }

    private clearTokens() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
}
