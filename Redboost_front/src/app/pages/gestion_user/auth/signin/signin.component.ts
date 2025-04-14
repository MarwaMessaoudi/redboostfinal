import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../../service/auth.service';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../../environment';
import { CommonModule } from '@angular/common';

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
    CommonModule,
  ],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent {
  email: string = '';
  password: string = '';
  selectedRole: string = '';
  isSubmitted: boolean = false;
  loginError: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  onLogin() {
    this.isSubmitted = true;
    this.loginError = null; // Reset error state
    if (!this.email || !this.password) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Email et mot de passe requis' });
      return;
    }

    console.log('Attempting login with email:', this.email);
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        const accessToken = response.accessToken;
        const refreshToken = response.refreshToken;

        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }

        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Connexion réussie' });
        this.router.navigate(['dashboard']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        let errorMessage = 'Échec de la connexion';
        this.loginError = null; // Reset by default

        if (error.error && typeof error.error === 'object') {
          this.loginError = error.error.errorCode;
          switch (error.error.errorCode) {
            case 'AUTH008':
              errorMessage = 'Utilisateur non trouvé avec cet email';
              break;
            case 'AUTH010':
              errorMessage = 'Mot de passe incorrect';
              break;
            case 'AUTH009':
              errorMessage = error.error.message || 'Échec de l’authentification';
              break;
            default:
              errorMessage = 'Une erreur inattendue s’est produite';
          }
        } else {
          // Handle non-JSON or unexpected errors
          errorMessage = 'Erreur serveur ou réseau';
          console.error('Unexpected error format:', error);
        }

        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: errorMessage });
      },
    });
  }

  async onGoogleLogin() {
    this.isSubmitted = true;
    this.loginError = null; // Reset error state
    if (!this.selectedRole) {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Veuillez sélectionner un rôle' });
      return;
    }

    console.log('Firebase initialized with config:', environment.firebaseConfig);

    (await this.authService.googleLogin(this.selectedRole)).subscribe({
      next: (response: any) => {
        console.log('Google login successful:', response);
        const accessToken = response.accessToken;
        const refreshToken = response.refreshToken;

        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }

        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Connexion Google réussie' });
        this.router.navigate(['dashboard']);
      },
      error: (error: any) => {
        console.error('Google login failed:', error);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la connexion Google' });
      },
    });
  }
}