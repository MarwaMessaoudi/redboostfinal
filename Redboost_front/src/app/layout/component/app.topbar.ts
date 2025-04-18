import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { MenuModule } from 'primeng/menu';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../pages/service/auth.service';
import { Router } from '@angular/router';
import { RendezVousService, RendezVousDTO } from '../../pages/service/RendezVousService';
import { UserService } from '../../pages/service/UserService';
import { NotificationService } from '../../pages/service/notification.servie';
import { Subscription } from 'rxjs';
import { Menu } from 'primeng/menu';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterModule, CommonModule, StyleClassModule, MenuModule, AppConfigurator],
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
            <i [ngClass]="{ 'pi': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
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

        <!-- Join Now Button -->
        <button
          *ngIf="joinableRendezVous && joinableRendezVous.canJoinNow"
          class="layout-topbar-action join-now-button"
          (click)="joinMeeting(joinableRendezVous.meetingLink)"
        >
          <i class="pi pi-video"></i>
          <span>Rejoindre maintenant</span>
        </button>

        <!-- Notification Button -->
        <button
          type="button"
          class="layout-topbar-action notification-button"
          (click)="toggleNotifications($event)"
        >
          <i class="pi pi-inbox"></i>
          <span *ngIf="notificationItems.length > 0" class="notification-badge">{{ notificationItems.length }}</span>
          <span>Notifications ({{ notificationItems.length }})</span>
        </button>
        <p-menu #notificationMenu [model]="notificationItems" [popup]="true" appendTo="body"></p-menu>

        <!-- Profile Picture -->
        <a routerLink="/profile" class="layout-topbar-action profile-picture-container">
          <img
            *ngIf="user?.profile_pictureurl"
            [src]="user.profile_pictureurl"
            alt="Profile Picture"
            class="profile-picture"
          />
          <i *ngIf="!user?.profile_pictureurl" class="pi pi-user"></i>
        </a>

        <!-- Logout Button -->
        <button class="layout-topbar-action" (click)="logout()">
          <i class="pi pi-sign-out"></i>
        </button>

        <!-- Menu Toggle -->
        <button
          class="layout-topbar-menu-button layout-topbar-action"
          pStyleClass="@next"
          enterFromClass="hidden"
          enterActiveClass="animate-scalein"
          leaveToClass="hidden"
          leaveActiveClass="animate-fadeout"
          [hideOnOutsideClick]="true"
        >
          <i class="pi pi-ellipsis-v"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .layout-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      height: 60px;
      background: #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .layout-topbar-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

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

    .notification-button {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      color: #333;
      font-weight: 500;
      cursor: pointer;
    }

    .notification-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #ff4d4f;
      color: white;
      border-radius: 50%;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      min-width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
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

    :host ::ng-deep .p-menuitem-link {
      padding: 16px 20px !important;
      display: flex;
      align-items: center;
      gap: 16px;
      color: #333 !important;
      font-size: 15px;
      font-weight: 500;
      transition: background-color 0.3s ease, transform 0.2s ease;
    }

    :host ::ng-deep .p-menuitem-icon {
      color: #ff4d4f !important;
      font-size: 24px !important;
      animation: pulse 2s infinite ease-in-out;
    }

    :host ::ng-deep .p-menuitem-link:hover {
      background: rgba(255, 255, 255, 0.3) !important;
      color: #ff4d4f !important;
      transform: translateX(5px);
    }

    :host ::ng-deep .p-menuitem-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 280px;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `]
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

  @ViewChild('notificationMenu') notificationMenu!: Menu;

  constructor(
    public layoutService: LayoutService,
    private authService: AuthService,
    private router: Router,
    private rendezVousService: RendezVousService,
    private userService: UserService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Authenticate and initialize user data
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.id;
        this.userRole = user.role;
        this.checkJoinableRendezVous();
        this.intervalId = setInterval(() => this.checkJoinableRendezVous(), 30000);

        // Initialize notifications
        this.notificationService.connect(this.userId.toString());
        this.notificationSub = this.notificationService.messages.subscribe(message => {
          if (!message.startsWith('Connected')) {
            this.notifications.push(message);
            this.updateNotificationItems();
          }
        });
      }
    });

    // Subscribe to user profile data
    this.userService.user$.subscribe(user => {
      this.user = user;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.notificationSub) this.notificationSub.unsubscribe();
    this.notificationService.disconnect();
  }

  toggleDarkMode() {
    this.layoutService.layoutConfig.update(state => ({ ...state, darkTheme: !state.darkTheme }));
  }

  checkJoinableRendezVous(): void {
    if (!this.userId || !this.userRole) return;

    const serviceCall = this.userRole === 'ENTREPRENEUR'
      ? this.rendezVousService.getJoinableRendezVousForEntrepreneur(this.userId)
      : this.rendezVousService.getJoinableRendezVousForCoach(this.userId);

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
    this.notificationItems = this.notifications.map((msg, index) => ({
      label: msg,
      icon: 'pi pi-bell',
      command: () => console.log('Notification clicked:', msg)
    }));
    this.cdr.detectChanges();
  }
}