import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../auth.service';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../environment';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    FormsModule,
    RouterModule,
    RippleModule,
  ],
  templateUrl: './signin.component.html', // Reference the external HTML file
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  onLogin() {
    console.log('Attempting login with email:', this.email);
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        const accessToken = response.accessToken;
        const refreshToken = response.refreshToken;
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          console.log('Access token stored:', localStorage.getItem('accessToken'));
        } else {
          console.warn('No accessToken in response');
        }
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
          console.log('Refresh token stored:', localStorage.getItem('refreshToken'));
        }
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Login successful' });
        this.router.navigate(['dashboard']).then(() => {
          console.log('Navigated to dashboard');
        });
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Login failed' });
      },
    });
  }

  onGoogleLogin() {
    console.log('Firebase initialized with config:', environment.firebaseConfig);
    this.authService.googleLogin().subscribe({
      next: (response) => {
        console.log('Google login successful:', response);
        this.router.navigate(['dashboard']);

        const token = response.token;
        if (token) {
          // Store the token in local storage
          localStorage.setItem('authToken', token);
        }
      },
      error: (error) => {
        console.error('Google login failed:', error);
      },
    });
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['landing']);
  }
}