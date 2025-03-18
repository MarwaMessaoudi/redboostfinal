import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

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
    private demoActor: string = 'entrepreneur'; // Change to 'coach' or 'investor' for demo

    ngOnInit() {
        if (this.demoActor === 'entrepreneur') {
            this.model = this.getEntrepreneurMenu();
        } else if (this.demoActor === 'coach') {
            this.model = this.getCoachMenu();
        } else if (this.demoActor === 'investor') {
            this.model = this.getInvestorMenu();
        }
    }

    // Entrepreneur Menu (full set from original)
    private getEntrepreneurMenu(): MenuItem[] {
        return [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] }]
            },
            {
                label: 'Projet',
                items: [
                    { label: 'Projet', icon: 'pi pi-fw pi-home', routerLink: ['/addprojet'] },
                    { label: 'Projets', icon: 'pi pi-fw pi-home', routerLink: ['/GetProjet'] }
                ]
            },
            {
                label: 'Accompganement',
                items: [{ label: 'Accompagnement', icon: 'pi pi-fw pi-home', routerLink: ['/phases'] }]
            },
            {
                label: 'Rendez Vous',
                items: [
                    { label: 'Rendez-vous', icon: 'pi pi-fw pi-calendar', routerLink: ['/appointments'] },
                    { label: 'Meeting', icon: 'pi pi-fw pi-calendar', routerLink: ['/meeting'] },
                    { label: 'My meetings List', icon: 'pi pi-fw pi-calendar', routerLink: ['/meetinglist'] }
                ]
            },
            {
                label: 'Mes Documents',
                items: [{ label: 'Docs ', icon: 'pi pi-fw pi-file', routerLink: ['/gestion-docs'] }]
            },
            {
                label: 'Mes Reclamations',
                items: [{ label: 'Reclamation ', icon: 'pi pi-fw pi-file', routerLink: ['/messagerie-reclamation'] }]
            },
            {
                label: 'Startup View',
                items: [{ label: 'My Requests', icon: 'pi pi-fw pi-briefcase', routerLink: ['/startup/v1'] }]
            }
        ];
    }

    // Coach Menu (subset from original)
    private getCoachMenu(): MenuItem[] {
        return [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] }]
            },
            {
                label: 'Rendez-vous ',
                items: [{ label: 'Disponibilités ', icon: 'pi pi-fw pi-calendar', routerLink: ['/appointments/received'] }]
            },
            {
                label: 'Accompagnements',
                items: [{ label: 'Accompagnement', icon: 'pi pi-fw pi-home', routerLink: ['/phases'] }]
            },
            {
                label: 'Mes Projets',
                items: [{ label: 'Projets', icon: 'pi pi-fw pi-home', routerLink: ['/GetProjet'] }]
            },
            {
                label: 'les Documents',
                items: [{ label: 'Docs ', icon: 'pi pi-fw pi-file', routerLink: ['/gestion-docs'] }]
            },
            {
                label: 'Mes Reclamations',
                items: [{ label: 'Reclamation ', icon: 'pi pi-fw pi-file', routerLink: ['/messagerie-reclamation'] }]
            }
        ];
    }

    // Investor Menu (subset from original)
    private getInvestorMenu(): MenuItem[] {
        return [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/dashboard'] }]
            },
            {
                label: 'Marketplace',
                items: [{ label: 'Marketplace', icon: 'pi pi-fw pi-home', routerLink: ['/marketplace/v1'] }]
            },
            {
                label: 'Startups',
                items: [{ label: 'My Startups', icon: 'pi pi-fw pi-briefcase', routerLink: ['/investor/v1'] }]
            },
            {
                label: 'les Documents',
                items: [{ label: 'Docs ', icon: 'pi pi-fw pi-file', routerLink: ['/gestion-docs'] }]
            },
            {
                label: 'Mes Reclamations',
                items: [{ label: 'Reclamation ', icon: 'pi pi-fw pi-file', routerLink: ['/messagerie-reclamation'] }]
            }
        ];
    }
}
