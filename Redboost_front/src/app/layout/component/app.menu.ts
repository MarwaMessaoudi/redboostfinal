import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
        <ul class="layout-menu">
            <ng-container *ngFor="let item of model; let i = index">
                <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul>
    `
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];

    constructor(
        private http: HttpClient,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.fetchUserRoleAndSetMenu();
    }

    private fetchUserRoleAndSetMenu(): void {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No authentication token found. Please log in.'
            });
            this.router.navigate(['/signin']);
            return;
        }

        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        this.http.get('http://localhost:8085/users/profile', { headers }).subscribe({
            next: (response: any) => {
                const userRole = response.role;
                this.setMenuBasedOnRole(userRole);
            },
            error: (error) => {
                console.error('Failed to fetch user profile:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to fetch user role'
                });
                this.router.navigate(['/signin']);
            }
        });
    }

    private getProfileMenuItem(): MenuItem {
        return {
            label: 'Profile',
            items: [
                {
                    label: 'Profile',
                    icon: 'pi pi-fw pi-user-edit', // Improved icon for profile editing
                    routerLink: ['/profile']
                }
            ]
        };
    }

    private setMenuBasedOnRole(role: string): void {
        let roleMenu: MenuItem[] = [];
        switch (role) {
            case 'ENTREPRENEUR':
                roleMenu = this.getEntrepreneurMenu();
                break;
            case 'COACH':
                roleMenu = this.getCoachMenu();
                break;
            case 'INVESTOR':
                roleMenu = this.getInvestorMenu();
                break;
            case 'SUPERADMIN':
                roleMenu = this.getSuperAdminMenu();
                break;
            case 'ADMIN':
                roleMenu = this.getAdminMenu();
                break;
            default:
                console.warn('Unknown role:', role);
                roleMenu = [];
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Warning',
                    detail: 'Unknown user role detected'
                });
        }
        this.model = [...roleMenu, this.getProfileMenuItem()];
    }

    private getSuperAdminMenu(): MenuItem[] {
        return [
            {
                label: 'Home',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/dashboard'] } // Chart icon for dashboard
                ]
            },
            {
                label: 'Coach Requests',
                items: [
                    { label: 'Coach Requests', icon: 'pi pi-fw pi-users', routerLink: ['/all-coach-requests'] } // Users icon for requests
                ]
            },
            {
                label: 'Utilisateurs',
                items: [
                    { label: 'Tous les utilisateurs', icon: 'pi pi-fw pi-user', routerLink: ['/all-users'] } // User icon for users
                ]
            },
            {
                label: 'Manage Types',
                items: [
                    { label: 'Manage Types', icon: 'pi pi-fw pi-tags', routerLink: ['/staff-types'] } // Tags icon for types
                ]
            },
            {
                label: 'Filter Staff Data',
                items: [
                    { label: 'Filter Staff Data', icon: 'pi pi-fw pi-filter', routerLink: ['/staff-filter'] } // Filter icon retained
                ]
            },
            {
                label: 'Gestion de programmes',
                items: [
                    { label: 'Gestion de programmes', icon: 'pi pi-fw pi-folder', routerLink: ['/ProgramMonitoring'] } // Folder icon for programs
                ]
            }
        ];
    }

    private getAdminMenu(): MenuItem[] {
        return [
            {
                label: 'Home',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/dashboard'] } // Chart icon for dashboard
                ]
            },

            {
                label: 'Gestion de programmes',
                items: [
                    { label: 'Gestion de programmes', icon: 'pi pi-fw pi-folder', routerLink: ['/ProgramMonitoring'] } // Folder icon for programs
                ]
            },
            {
                label: 'Reclamations',
                items: [
                    { label: 'All Reclamations', icon: 'pi pi-fw pi-file-excel', routerLink: ['/all-reclamations'] } // File-excel for reclamations
                ]
            },
            {
                label: 'Documents',
                items: [
                    { label: 'Documents', icon: 'pi pi-fw pi-file', routerLink: ['/documents'] } // File icon for documents
                ]
            },
            {
                label: 'Ressources',
                items: [
                    { label: 'Toutes les ressources', icon: 'pi pi-fw pi-box', routerLink: ['/all-resourses'] } // Box icon for resources
                ]
            },
            {
                label: 'Clients',
                items: [
                    { label: 'Ajouter un client', icon: 'pi pi-fw pi-user-plus', routerLink: ['/customers'] } // User-plus for adding clients
                ]
            },
            {
                label: 'Services',
                items: [
                    { label: 'Ajouter un service', icon: 'pi pi-fw pi-cog', routerLink: ['/services'] } // Cog for services
                ]
            },
            {
                label: 'Factures / Devis',
                items: [
                    { label: 'Générer une facture / devis', icon: 'pi pi-fw pi-money-bill', routerLink: ['/inv'] } // Money-bill for invoices
                ]
            }
        ];
    }

    private getEntrepreneurMenu(): MenuItem[] {
        return [
            {
                label: 'Home',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/dashboard'] } // Chart icon for dashboard
                ]
            },
            {
                label: 'Projets',
                items: [
                    { label: 'Projets', icon: 'pi pi-fw pi-briefcase', routerLink: ['/GetProjet'] } // Briefcase for projects
                ]
            },
            {
                label: 'Gestion Communication',
                items: [
                    { label: 'Communication', icon: 'pi pi-fw pi-comments', routerLink: ['/gestion_comm'] } // Comments for communication
                ]
            },
            {
                label: 'Documents',
                items: [
                    { label: 'Documents', icon: 'pi pi-fw pi-file', routerLink: ['/documents'] } // File icon for documents
                ]
            },
            {
                label: 'Rendez-vous',
                items: [
                    { label: 'Rendez-vous', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/appointments'] }, // Calendar-plus for appointments
                    { label: 'My Meetings List', icon: 'pi pi-fw pi-calendar', routerLink: ['/meeting-list'] } // Calendar for meetings
                ]
            },
            {
                label: 'Mes Réclamations',
                items: [
                    { label: 'Réclamation', icon: 'pi pi-fw pi-file-excel', routerLink: ['/messagerie-reclamation'] } // File-excel for reclamations
                ]
            },
            {
                label: 'Startup View',
                items: [
                    { label: 'My Requests', icon: 'pi pi-fw pi-briefcase', routerLink: ['/startup/v1'] } // Briefcase for startup requests
                ]
            }
        ];
    }

    private getCoachMenu(): MenuItem[] {
        return [
            {
                label: 'Home',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/dashboard'] } // Chart icon for dashboard
                ]
            },
            {
                label: 'Rendez-vous',
                items: [
                    { label: 'Disponibilités', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/appointments/received'] } // Calendar-plus for availability
                ]
            },
            {
                label: 'Projets',
                items: [
                    { label: 'Projets', icon: 'pi pi-fw pi-briefcase', routerLink: ['/GetProjet'] } // Briefcase for projects
                ]
            },
            {
                label: 'Documents',
                items: [
                    { label: 'Documents', icon: 'pi pi-fw pi-file', routerLink: ['/documents'] } // File icon for documents
                ]
            },
            {
                label: 'Mes Réclamations',
                items: [
                    { label: 'Réclamation', icon: 'pi pi-fw pi-file-excel', routerLink: ['/messagerie-reclamation'] } // File-excel for reclamations
                ]
            },
            {
                label: 'Gestion Communication',
                items: [
                    { label: 'Communication', icon: 'pi pi-fw pi-comments', routerLink: ['/gestion_comm'] } // Comments for communication
                ]
            }
        ];
    }

    private getInvestorMenu(): MenuItem[] {
        return [
            {
                label: 'Home',
                items: [
                    { label: 'Dashboard', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/dashboard'] } // Chart icon for dashboard
                ]
            },
            {
                label: 'Marketplace',
                items: [
                    { label: 'Marketplace', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/marketplace'] } // Shopping-cart for marketplace
                ]
            },
            {
                label: 'Startups',
                items: [
                    { label: 'My Startups', icon: 'pi pi-fw pi-briefcase', routerLink: ['/investor/v1'] } // Briefcase for startups
                ]
            },
            {
                label: 'Documents',
                items: [
                    { label: 'Documents', icon: 'pi pi-fw pi-file', routerLink: ['/documents'] } // File icon for documents
                ]
            },
            {
                label: 'Mes Réclamations',
                items: [
                    { label: 'Réclamation', icon: 'pi pi-fw pi-file-excel', routerLink: ['/messagerie-reclamation'] } // File-excel for reclamations
                ]
            }
        ];
    }
}
