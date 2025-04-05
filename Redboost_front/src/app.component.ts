import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthService } from './app/pages/service/auth.service';
import { UserService } from './app/pages/service/UserService'; // Import UserService
import { HttpClient } from '@angular/common/http'; // Import HttpClient

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService, // Inject UserService
    private http: HttpClient // Inject HttpClient
  ) {}

  ngOnInit() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);

    if (accessToken && refreshToken) {
      this.authService.verifyToken().subscribe({
        next: (response) => {
          console.log('Token verification successful:', response);
          this.fetchUserProfile(); // Fetch user profile after token verification
          this.router.navigate(['']);
        },
        error: (error) => {
          console.error('Token verification failed:', error);
          this.clearTokens();
          this.router.navigate(['']);
        },
      });
    } else {
      this.authService.refreshToken().subscribe({
        next: (response: any) => {
          console.log('Token refresh successful:', response);
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          this.fetchUserProfile(); // Fetch user profile after token refresh
          this.router.navigate(['']);
        },
        error: (error) => {
          console.error('Token refresh failed:', error);
          this.clearTokens();
          this.router.navigate(['']);
        },
      });
    }
  }

  // Fetch user profile data and set it in UserService
  fetchUserProfile() {
    this.http.get('http://localhost:8085/users/profile', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}` // Include token in request
      }
    }).subscribe({
      next: (response: any) => {
        console.log('User profile fetched successfully:', response);
        this.userService.setUser(response); // Set user data in UserService
      },
      error: (error) => {
        console.error('Failed to fetch user profile:', error);
        // Optionally handle the error, e.g., clear user data
        this.userService.setUser(null);
      }
    });
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}