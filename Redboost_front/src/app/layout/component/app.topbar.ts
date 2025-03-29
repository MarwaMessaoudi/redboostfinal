import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../pages/auth/auth.service';
import { Router } from '@angular/router';
import { RendezVousService, RendezVousDTO } from '../../services/RendezVousService';
import { UserService } from '../../pages/service/UserService';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator],
    template: `
        <div class="layout-topbar">
            <div class="layout-topbar-logo-container">
                <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                    <i class="pi pi-bars"></i>
                </button>
                <a class="layout-topbar-logo" routerLink="/">
                    <img src="/assets/images/logo_redboost.png" alt="RedBoost Logo" class="redboost-logo" />
                </a>
            </div>

            <div class="layout-topbar-actions">
                <div class="layout-config-menu">
                    <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                        <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                    </button>
                    <div class="relative">
                        <a
                            routerLink="/gestion-reclamation"
                            class="layout-topbar-action layout-topbar-action-highlight"
                            pStyleClass="@next"
                            enterFromClass="hidden"
                            enterActiveClass="animate-scalein"
                            leaveToClass="hidden"
                            leaveActiveClass="animate-fadeout"
                            [hideOnOutsideClick]="true"
                        >
                            <i class="pi pi-plus"></i>
                        </a>
                        <app-configurator />
                    </div>
                </div>

                <!-- Bouton "Rejoindre maintenant" -->
                <button *ngIf="joinableRendezVous && joinableRendezVous.canJoinNow"
                        class="layout-topbar-action join-now-button"
                        (click)="joinMeeting(joinableRendezVous.meetingLink)">
                    <i class="pi pi-video"></i>
                    <span>Rejoindre maintenant</span>
                </button>

                <!-- Logout Button -->
                <button class="layout-topbar-action" (click)="logout()">
                    <i class="pi pi-sign-out"></i>
                </button>

                <!-- Profile Picture instead of Icon -->
                <a routerLink="/profile" class="layout-topbar-action profile-picture-container">
                    <img *ngIf="user?.profile_pictureurl" [src]="user.profile_pictureurl" alt="Profile Picture" class="profile-picture" />
                    <i *ngIf="!user?.profile_pictureurl" class="pi pi-user"></i> <!-- Fallback to icon if no picture -->
                </a>

                <button class="layout-topbar-menu-button layout-topbar-action"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true">
                    <i class="pi pi-ellipsis-v"></i>
                </button>

                <div class="layout-topbar-menu hidden lg:block">
                    <div class="layout-topbar-menu-content">
                        <button type="button" class="layout-topbar-action">
                            <i class="pi pi-inbox"></i>
                            <span>Messages</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .join-now-button {
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 8px 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .join-now-button:hover {
            background-color: #45a049;
        }

        .join-now-button i {
            font-size: 16px;
        }

        .profile-picture-container {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            cursor: pointer;
            transition: transform 0.3s;
        }

        .profile-picture-container:hover {
            transform: scale(1.1);
        }

        .profile-picture {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    `]
})
export class AppTopbar implements OnInit, OnDestroy {
    items!: MenuItem[];
    joinableRendezVous: RendezVousDTO | null = null;
    userId: number | null = null;
    userRole: string | null = null;
    user: any = null; // Declare user property to store profile data
    private intervalId: any;

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private router: Router,
        private rendezVousService: RendezVousService,
        private cdr: ChangeDetectorRef,
        private userService: UserService
    ) {
        console.log('RendezVousService injecté:', this.rendezVousService);
    }

    ngOnInit(): void {
        this.authService.getCurrentUser().subscribe(user => {
            console.log('Utilisateur connecté:', user);
            if (user) {
                this.userId = user.id;
                this.userRole = user.role;
                console.log('userId:', this.userId, 'userRole:', this.userRole);
                this.checkJoinableRendezVous();
                this.intervalId = setInterval(() => {
                    this.checkJoinableRendezVous();
                }, 30000);
            } else {
                console.log('Aucun utilisateur connecté');
            }
        });

        // Subscribe to UserService to get user profile data including profile picture
        this.userService.user$.subscribe(user => {
            this.user = user;
            this.cdr.detectChanges(); // Ensure UI updates when user data changes
        });
    }

    ngOnDestroy(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    checkJoinableRendezVous(): void {
        if (!this.userId || !this.userRole) {
            console.log('Utilisateur non connecté ou rôle non défini');
            return;
        }

        console.log('Appel de checkJoinableRendezVous pour userId:', this.userId, 'userRole:', this.userRole);

        if (this.userRole === 'ENTREPRENEUR') {
            this.rendezVousService.getJoinableRendezVousForEntrepreneur(this.userId).subscribe(
                (data: RendezVousDTO) => {
                    console.log('Joinable rendez-vous for entrepreneur:', data);
                    this.joinableRendezVous = data;
                    this.cdr.detectChanges();
                },
                (error: any) => {
                    console.log('Error fetching joinable rendez-vous for entrepreneur:', error);
                    if (error.status === 204) {
                        this.joinableRendezVous = null;
                    } else {
                        console.error('Erreur lors de la récupération du rendez-vous joignable', error);
                    }
                    this.cdr.detectChanges();
                }
            );
        } else if (this.userRole === 'COACH') {
            this.rendezVousService.getJoinableRendezVousForCoach(this.userId).subscribe(
                (data: RendezVousDTO) => {
                    console.log('Joinable rendez-vous for coach:', data);
                    this.joinableRendezVous = data;
                    this.cdr.detectChanges();
                },
                (error: any) => {
                    console.log('Error fetching joinable rendez-vous for coach:', error);
                    if (error.status === 204) {
                        this.joinableRendezVous = null;
                    } else {
                        console.error('Erreur lors de la récupération du rendez-vous joignable', error);
                    }
                    this.cdr.detectChanges();
                }
            );
        }
    }

    joinMeeting(meetingLink: string): void {
        window.open(meetingLink, '_blank');
    }

    logout() {
        this.authService.logout().subscribe(
            () => {
                this.router.navigate(['/landing']);
            },
            (error) => {
                console.error('Logout failed:', error);
            }
        );
    }
}