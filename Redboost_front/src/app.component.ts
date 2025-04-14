import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthService } from './app/pages/service/auth.service';
import { UserService } from './app/pages/service/UserService';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `<router-outlet></router-outlet>`,
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
    console.log('Current URL:', currentUrl);

    // Skip authentication check for public routes
    // Skip authentication check for public routes
  if (this.publicRoutes.includes(currentUrl)) {
    console.log('Public route detected, skipping auth check');
    return;
  }

    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);

    if (accessToken && refreshToken) {
      this.authService.verifyToken().subscribe({
        next: (response) => {
          console.log('Token verification successful:', response);
          this.fetchUserProfile();
        },
        error: (error) => {
          console.error('Token verification failed:', error);
          this.handleAuthFailure();
        },
      });
    } else {
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
        },
      });
    }
  }

  private handleAuthFailure() {
    this.clearTokens();
    this.router.navigate(['']); // Redirect to landing only for protected routes
  }

  fetchUserProfile() {
    this.http.get('http://localhost:8085/users/profile', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
      }
    }).subscribe({
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

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}