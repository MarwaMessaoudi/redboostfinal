import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { MenuModule } from 'primeng/menu';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../pages/frontoffice/service/auth.service';
import { RendezVousService, RendezVousDTO } from '../../pages/frontoffice/service/RendezVousService';
import { UserService } from '../../pages/frontoffice/service/UserService';
import { NotificationService } from '../../pages/frontoffice/service/notification.servie';
import { Subscription } from 'rxjs';
import { Menu } from 'primeng/menu';
import { ProjetService } from '../../pages/frontoffice/service/projet-service.service';
import { Projet } from '../../models/Projet';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, MenuModule, AppConfigurator, MatTooltipModule],
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
                            matTooltip="Ajouter une réclamation"
                        >
                            <i class="pi pi-plus"></i>
                        </a>
                        <app-configurator />
                    </div>
                </div>

                <button type="button" class="layout-topbar-action projects-button" (click)="toggleProjectMenu($event)" matTooltip="Mes Projets">
                    <i class="pi pi-briefcase"></i>
                </button>
                <p-menu #projectMenu [model]="projectMenuItems" [popup]="true" appendTo="body"></p-menu>

                <button *ngIf="joinableRendezVous && joinableRendezVous.canJoinNow" class="layout-topbar-action join-now-button" (click)="joinMeeting(joinableRendezVous.meetingLink)">
                    <i class="pi pi-video"></i>
                    <span>Rejoindre maintenant</span>
                </button>

                <button type="button" class="layout-topbar-action notification-button" (click)="toggleNotifications($event)">
                    <i class="pi pi-inbox"></i>
                    <span *ngIf="notificationItems.length > 0" class="notification-badge">{{ notificationItems.length }}</span>
                    <span>Notifications ({{ notificationItems.length }})</span>
                </button>
                <p-menu #notificationMenu [model]="notificationItems" [popup]="true" appendTo="body"></p-menu>

                <a routerLink="/profile" class="layout-topbar-action profile-picture-container">
                    <img *ngIf="user?.profile_pictureurl" [src]="user.profile_pictureurl" alt="Profile Picture" class="profile-picture" />
                    <i *ngIf="!user?.profile_pictureurl" class="pi pi-user"></i>
                </a>

                <button class="layout-topbar-action" (click)="logout()">
                    <i class="pi pi-sign-out"></i>
                </button>

                <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                    <i class="pi pi-ellipsis-v"></i>
                </button>
            </div>
        </div>
    `,
    styles: [
        `
            .layout-topbar {
                position: fixed;
                height: 4rem;
                z-index: 997;
                left: 0;
                top: 0;
                width: 100%;
                padding: 0 2rem;
                background-color: var(--surface-card);
                transition: left var(--layout-section-transition-duration);
                display: flex;
                align-items: center;
                border-radius: 0 0 12px 12px;
            }

            .layout-topbar-logo-container {
                width: 20rem;
                display: flex;
                align-items: center;
            }

            .layout-topbar-logo {
                display: inline-flex;
                align-items: center;
                font-size: 1.5rem;
                border-radius: var(--content-border-radius);
                color: #0a4955;
                font-weight: 500;
                gap: 0.5rem;
                display: flex;
                align-items: center;
            }

            .redboost-logo {
                height: 50px;
                width: auto;
            }

            .layout-topbar-action {
                display: inline-flex;
                justify-content: center;
                align-items: center;
                color: #245c67;
                border-radius: 50%;
                width: 2.5rem;
                height: 2.5rem;
                transition: background-color var(--element-transition-duration);
                cursor: pointer;
                border: none;
                background: none;

                &:hover {
                    background-color: #568086;
                    color: #0a4955;
                }

                &:focus-visible {
                    outline: 2px solid #245c67;
                    outline-offset: 2px;
                }

                i {
                    font-size: 1.25rem;
                }

                span {
                    font-size: 1rem;
                    display: none;
                }

                &.layout-topbar-action-highlight {
                    background-color: #db1e37;
                    color: #ffffff;
                    &:hover {
                        background-color: #e44d62;
                    }
                }
            }

            .layout-menu-button.layout-topbar-action {
                width: 3rem;
                height: 3rem;

                i {
                    font-size: 1.5rem;
                }
            }

            .layout-menu-button {
                margin-right: 0.5rem;
            }

            .layout-topbar-menu-button {
                display: none;
            }

            .layout-topbar-actions {
                margin-left: auto;
                display: flex;
                gap: 1rem;
                align-items: center;
            }

            .layout-topbar-menu-content {
                display: flex;
                gap: 1rem;
            }

            .layout-config-menu {
                display: flex;
                gap: 1rem;
                align-items: center;
            }

            .join-now-button,
            .notification-button,
            .projects-button {
                width: auto;
                height: auto;
                border-radius: var(--content-border-radius, 5px);
                padding: 0.5rem 1rem;
                gap: 0.5rem;
                display: flex;
                align-items: center;
                font-weight: 500;
                color: #245c67;
                background: none;
                border: none;
                transition: background-color var(--element-transition-duration);
            }

            .join-now-button,
            .notification-button {
                span {
                    display: inline;
                    font-size: 1rem;
                }
                i {
                    font-size: 1.25rem;
                }
            }

            .join-now-button {
                background-color: #4caf50;
                color: white;
                &:hover {
                    background-color: #45a049;
                }
            }

            .notification-button {
                position: relative;
            }

            .notification-badge {
                position: absolute;
                top: -0.5rem;
                right: -0.5rem;
                background: #ff4d4f;
                color: white;
                border-radius: 50%;
                padding: 0.25rem 0.5rem;
                font-size: 0.75rem;
                font-weight: 600;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                min-width: 1.25rem;
                height: 1.25rem;
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 1;
                z-index: 1;
            }

            .profile-picture-container {
                width: 2.5rem;
                height: 2.5rem;
                border-radius: 50%;
                overflow: hidden;
                cursor: pointer;
                transition: transform var(--element-transition-duration);
                display: flex;
                justify-content: center;
                align-items: center;
                border: none;
            }

            .profile-picture {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .profile-picture-container i.pi-user {
                font-size: 1.5rem;
                color: #555;
            }

            .projects-button {
                i {
                    font-size: 1.25rem;
                }
                span {
                    display: none;
                }
            }

            :host ::ng-deep .p-menu {
                z-index: 1002 !important;
                min-width: 350px;
                background: linear-gradient(135deg, rgba(173, 216, 230, 0.8), rgba(255, 182, 193, 0.8));
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                padding: 12px 0;
                animation: fadeIn 0.3s ease-in-out;
            }

            :host ::ng-deep .p-menu .p-menuitem-link {
                padding: 16px 20px !important;
                display: flex;
                align-items: center;
                gap: 16px;
                color: #333 !important;
                font-size: 15px;
                font-weight: 500;
                transition:
                    background-color 0.3s ease,
                    transform 0.2s ease;
            }

            :host ::ng-deep .p-menu .p-menuitem-icon {
                color: #ff4d4f !important;
                font-size: 24px !important;
                animation: pulse 2s infinite ease-in-out;
            }

            :host ::ng-deep .p-menu .p-menuitem-link:hover {
                background: rgba(255, 255, 255, 0.3) !important;
                color: #ff4d4f !important;
                transform: translateX(5px);
            }

            :host ::ng-deep .p-menu .p-menuitem-text {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 280px;
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes pulse {
                0% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.1);
                }
                100% {
                    transform: scale(1);
                }
            }

            @media (max-width: 991px) {
                .layout-topbar {
                    padding: 0 2rem;
                    border-radius: 0 0 12px 12px;

                    .layout-topbar-logo-container {
                        width: auto;
                    }

                    .layout-menu-button {
                        margin-left: 0;
                        margin-right: 0.5rem;
                    }

                    .layout-menu-button.layout-topbar-action {
                        width: 3rem;
                        height: 3rem;

                        i {
                            font-size: 1.5rem;
                        }
                    }

                    .layout-topbar-menu-button {
                        display: inline-flex;
                    }

                    .layout-topbar-menu {
                        position: absolute;
                        background-color: var(--surface-overlay);
                        transform-origin: top;
                        box-shadow:
                            0px 3px 5px rgba(0, 0, 0, 0.02),
                            0px 0px 2px rgba(0, 0, 0, 0.05),
                            0px 1px 4px rgba(0, 0, 0, 0.08);
                        border-radius: var(--content-border-radius);
                        padding: 1rem;
                        right: 2rem;
                        top: 4rem;
                        min-width: 15rem;
                        border: 1px solid #ea7988;
                    }

                    .layout-topbar-actions {
                        gap: 1rem;
                        align-items: center;
                    }

                    .layout-topbar-menu .layout-topbar-menu-content {
                        flex-direction: column;
                        gap: 0.5rem;
                    }

                    .layout-topbar-menu .layout-topbar-action {
                        display: flex;
                        width: 100%;
                        height: auto;
                        justify-content: flex-start;
                        border-radius: var(--content-border-radius);
                        padding: 0.5rem 1rem;
                        color: #0a4955;

                        i {
                            font-size: 1rem;
                            margin-right: 0.5rem;
                        }

                        span {
                            font-weight: 500;
                            display: block;
                        }

                        &:hover {
                            background-color: #568086;
                        }
                    }

                    .layout-topbar-menu .join-now-button,
                    .layout-topbar-menu .notification-button,
                    .layout-topbar-menu .projects-button {
                        padding: 0.5rem 1rem;
                        width: auto;
                        justify-content: flex-start;
                        gap: 0.5rem;
                        background: none;
                        color: #0a4955;
                        font-weight: 500;
                    }

                    .layout-topbar-menu .join-now-button {
                        background-color: #4caf50;
                        color: white;
                    }

                    .layout-topbar-menu .join-now-button:hover {
                        background-color: #45a049;
                    }

                    .layout-topbar-menu .notification-badge {
                        position: static;
                        margin-left: auto;
                        transform: none;
                        box-shadow: none;
                        min-width: auto;
                        height: auto;
                        padding: 0;
                        background: none;
                        color: #ff4d4f;
                        font-size: 1rem;
                        font-weight: 500;
                    }

                    .layout-topbar-menu .profile-picture-container {
                        width: 2.5rem;
                        height: 2.5rem;
                        flex-shrink: 0;
                    }
                }
            }
        `
    ]
})
export class AppTopbar implements OnInit, OnDestroy {
    items!: MenuItem[];
    joinableRendezVous: RendezVousDTO | null = null;
    userId: number | null = null;
    userRole: string | null = null;
    user: any = null;
    notifications: string[] = [];
    notificationItems: MenuItem[] = [];
    private intervalId: any;
    private notificationSub?: Subscription;

    userProjects: Projet[] = [];
    projectMenuItems: MenuItem[] = [];
    isLoadingProjects: boolean = false;

    @ViewChild('notificationMenu') notificationMenu!: Menu;
    @ViewChild('projectMenu') projectMenu!: Menu;

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private router: Router,
        private rendezVousService: RendezVousService,
        private userService: UserService,
        private notificationService: NotificationService,
        private cdr: ChangeDetectorRef,
        private projetService: ProjetService
    ) {}

    ngOnInit(): void {
        this.authService.getCurrentUser().subscribe((user) => {
            if (user) {
                this.userId = user.id;
                this.userRole = user.role;
                this.checkJoinableRendezVous();
                this.intervalId = setInterval(() => this.checkJoinableRendezVous(), 30000);

                this.notificationService.connect(this.userId.toString());
                this.notificationSub = this.notificationService.messages.subscribe((message) => {
                    if (!message.startsWith('Connected')) {
                        this.notifications.push(message);
                        this.updateNotificationItems();
                    }
                });
            }
        });

        this.userService.user$.subscribe((user) => {
            this.user = user;
            this.cdr.detectChanges();
        });
    }

    ngOnDestroy(): void {
        if (this.intervalId) clearInterval(this.intervalId);
        if (this.notificationSub) this.notificationSub.unsubscribe();
        this.notificationService.disconnect();
    }

    checkJoinableRendezVous(): void {
        if (!this.userId || !this.userRole) return;

        const serviceCall = this.userRole === 'ENTREPRENEUR' ? this.rendezVousService.getJoinableRendezVousForEntrepreneur(this.userId) : this.rendezVousService.getJoinableRendezVousForCoach(this.userId);

        serviceCall.subscribe({
            next: (data: RendezVousDTO) => {
                this.joinableRendezVous = data;
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                if (error.status === 204) this.joinableRendezVous = null;
                this.cdr.detectChanges();
            }
        });
    }

    joinMeeting(meetingLink: string): void {
        window.open(meetingLink, '_blank');
    }

    logout() {
        this.authService.logout().subscribe({
            next: () => this.router.navigate(['/landing']),
            error: (error) => {
                console.error('Logout failed:', error);
                this.router.navigate(['/landing']);
            }
        });
    }

    toggleNotifications(event: Event) {
        if (this.notificationMenu) this.notificationMenu.toggle(event);
    }

    updateNotificationItems() {
        this.notificationItems = this.notifications.map((msg) => ({
            label: msg,
            icon: 'pi pi-bell',
            command: () => console.log('Notification clicked:', msg)
        }));
        this.cdr.detectChanges();
    }

    loadUserProjects(): void {
        if (!this.userId) {
            console.warn('User ID not available to load projects.');
            Swal.fire({
                icon: 'error',
                title: 'Erreur!',
                text: 'Impossible de charger les projets. Veuillez vous reconnecter.'
            });
            return;
        }

        if (this.isLoadingProjects) return; // Prevent multiple simultaneous requests
        this.isLoadingProjects = true;
        this.projectMenuItems = [{ label: 'Chargement...', icon: 'pi pi-spinner pi-spin', disabled: true }];
        this.cdr.detectChanges();

        this.projetService.getUserProjects().subscribe({
            next: (projets: Projet[]) => {
                this.userProjects = projets.map((projet, index) => {
                    if (!projet.id) projet.id = index + 1; // Ensure each project has an ID
                    return projet;
                });
                this.updateProjectMenuItems();
                this.isLoadingProjects = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading user projects:', error);
                this.userProjects = [];
                this.projectMenuItems = [{ label: 'Erreur de chargement', icon: 'pi pi-times-circle' }];
                this.isLoadingProjects = false;
                this.cdr.detectChanges();
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur!',
                    text: 'Échec du chargement des projets.'
                });
                if (error.status === 401) {
                    this.router.navigate(['/login']);
                }
            }
        });
    }

    updateProjectMenuItems(): void {
        if (this.userProjects.length === 0) {
            this.projectMenuItems = [{ label: 'Aucun projet trouvé', icon: 'pi pi-info-circle' }];
        } else {
            this.projectMenuItems = this.userProjects.map((projet) => ({
                label: projet.name,
                icon: 'pi pi-folder',
                command: () => {
                    this.navigateToProjectPhases(projet.id);
                }
            }));
        }
        this.cdr.detectChanges();
    }

    navigateToProjectPhases(projectId: number | undefined): void {
        if (!projectId || projectId === 0) {
            console.warn('Cannot navigate: Project ID is invalid.', projectId);
            Swal.fire({
                icon: 'error',
                title: 'Erreur!',
                text: 'ID du projet non défini.'
            });
            return;
        }
        this.router.navigate(['/phases'], { queryParams: { projectId: projectId } });
    }

    toggleProjectMenu(event: Event): void {
        if (this.projectMenu) {
            this.loadUserProjects(); // Fetch projects when opening the menu
            this.projectMenu.toggle(event);
        }
    }
}
