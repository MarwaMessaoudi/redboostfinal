import { Routes } from '@angular/router';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { GestionReclamationComponent } from './gestion-reclamation/gestion-reclamation.component';
import { MarketplaceComponent } from './marketplace/marketplace';
import { MeetingComponent } from './streaming/meeting/meeting.component';
import { MeetingListComponent } from './streaming/meetinglist/meeting-list.component';
import { AddProjetComponent } from './Projet/addprojet/addprojet.component';
import { AfficheProjetComponent } from './Projet/affiche-projet/affiche-projet.component';
import { DetailsProjetComponent } from './Projet/details-projet/details-projet.component';
import { AppointmentListComponent } from './appointments/appointment-list/appointment-list.component';
import { ShowProduitsComponent } from './Projet/Produit/show-produits/show-produits.component';

export const pagesRoutes: Routes = [
    { path: 'addprojet', component: AddProjetComponent },
    { path: 'GetProjet', component: AfficheProjetComponent },
    { path: 'details-projet/:id', component: DetailsProjetComponent },
    { path: 'ShowProd', component: ShowProduitsComponent },
    { path: 'appointment-list', component: AppointmentListComponent },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'gestion-reclamation', component: GestionReclamationComponent },
    { path: 'meeting', component: MeetingComponent },
    { path: 'meetinglist', component: MeetingListComponent },
    { path: '**', redirectTo: '/notfound' }, // Redirection pour les routes inconnues
    
];
