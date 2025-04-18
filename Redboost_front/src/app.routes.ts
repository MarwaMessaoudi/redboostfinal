import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Landing } from './app/pages/landing/landing';
import { GestionDocsComponent } from './app/pages/gestion-docs/gestion-docs.component';
import { UserLibraryComponent } from './app/pages/gestion-docs/gestion-folder/folder-details/user-library/user-library.component';
import { Notfound } from './app/pages/notfound/notfound';
import { GestionReclamationComponent } from './app/pages/gestion_reclamation/gestion-reclamation/gestion-reclamation.component';
import { MessagerieReclamationComponent } from './app/pages/gestion_reclamation/messagerie-reclamation/messagerie-reclamation.component';
import { PhaseListComponent } from './app/pages/gestion_accompagnement/phases/phase-list/phase-list.component';
import { KanbanBoardComponent } from './app/pages/gestion_accompagnement/kanban-board/kanban-board.component';
import { SigninComponent } from './app/pages/gestion_user/auth/signin/signin.component';
import { SignUpComponent } from './app/pages/gestion_user/auth/signup/signup.component';
import { ConfirmEmailComponent } from './app/pages/gestion_user/auth/confirm-email/confirm-email.component';
import { MarketplaceComponent } from './app/pages/marketplace/marketplace';
import { AppointmentsReceivedComponent } from './app/pages/gestion_rendez-vous/AppointmentsReceived/appointments-received.component';
import { AddProjetComponent } from './app/pages/gestion_startup/addprojet/addprojet.component';
import { AfficheProjetComponent } from './app/pages/gestion_startup/affiche-projet/affiche-projet.component';
import { DetailsProjetComponent } from './app/pages/gestion_startup/details-projet/details-projet.component';
import { SubFolderComponent } from './app/pages/gestion-docs/gestion-folder/sub-folder/sub-folder.component';
import { UserProfileComponent } from './app/pages/gestion_user/profile/profile.component';
import { DocumentsComponent } from './app/pages/documents/documents.component';
import { ContactLandingComponent } from './app/pages/landing/components/contact-landing';
import { MarketLandingComponent } from './app/pages/landing/components/market-landing';
import { CoachRequestComponent } from './app/pages/become_coach/coachrequest';
import { AllCoachRequestsComponent } from './app/pages/become_coach/all-coach-requests.component';
import { AllReclamationsComponent } from './app/pages/gestion_reclamation/all-reclamations/all-reclamations.component';
import { CoachDashboardComponent } from './app/pages/dashboard/coachdashboard/coach-dashboard.component';
import { InvestorDashboardComponent } from './app/pages/dashboard/inverstdashboard/investor-dashboard';
import { RoleGuard } from './role.guard';
import { DashboardRedirectComponent } from './app/pages/dashboard/dashboard-redirect/dashboard-redirect.component';
import { Dashboard } from './app/pages/dashboard/entrepredashboard/dashboard';
import { AppointmentListComponent } from './app/pages/gestion_rendez-vous/appointment-list/appointment-list.component';
import { ForgotPasswordComponent } from './app/pages/gestion_user/forgotpassword/forgotpassword.component';
import { ResetPasswordComponent } from './app/pages/gestion_user/reset-password/reset-password.component';
import { ChatComponent } from './app/pages/gestion_messagerie/chat/chat.component';
import { GestionCommunicationComponent } from './app/pages/gestion_messagerie/gestion-communication/gestion-communication.component';
import {MeetingDetailsPopupComponent} from './app/pages/gestion_rendez-vous/meeting-detail-popup/meeting-detail-popup.component';
import { MeetingListComponent } from './app/pages/gestion_rendez-vous/meetinglist/meeting-list.component';
import { UserListComponent } from './app/pages/allUsers/user-list.component';

import { StaffTypeListComponent } from './app/pages/database_management/staff-type-list/staff-type-list.component';
import { StaffTypeDetailComponent } from './app/pages/database_management/staff-type-detail/staff-type-detail.component';
import { StaffFilterComponent } from './app/pages/database_management/staff-filter/staff-filter.component';
import { ResourcesLandingComponent } from './app/pages/resourses-landing/ResourcesLandingComponent';
import {ResourcesComponent} from './app/pages/landing/components/resources.component';
import { KanbanActivityComponent } from './app/pages/gestion_programmes/kanban-activity/kanban-activity.component';
import { ProgramMonitoringComponent } from './app/pages/gestion_programmes/program-monitoring/program-monitoring.component';
import { ProgramDetailComponent } from './app/pages/gestion_programmes/program-details/program-details.component';
import { ShowProduitsComponent } from './app/pages/gestion_startup/Produit/show-produits/show-produits.component';
import { ShowServicePComponent } from './app/pages/gestion_startup/ServiceP/show-service-p/show-service-p.component';




export const pagesRoutes: Routes = [
  { path: 'addprojet', component: AddProjetComponent },
  { path: 'GetProjet', component: AfficheProjetComponent },
  { path: 'details-projet/:id', component: DetailsProjetComponent },
  { path: 'gestion-reclamation', component: GestionReclamationComponent },
  { path: 'marketplace', component: MarketplaceComponent },
  { path: 'appointments', component: AppointmentListComponent },
  { path: 'appointments/received', component: AppointmentsReceivedComponent },
  { path: 'profile', component: UserProfileComponent },
  { path: 'documents', component: DocumentsComponent },
  { path: 'marketlanding', component: MarketLandingComponent },
  {path:'chat',component:ChatComponent},
  {path:'gestion_comm', component:GestionCommunicationComponent},
  {path:'meeting-list', component:MeetingListComponent},
  {path:'meeting-details-popup', component:MeetingDetailsPopupComponent},
  {path:'all-users', component:UserListComponent},
  {path: 'staff-types',component: StaffTypeListComponent},
{path: 'staff-types/:id',component: StaffTypeDetailComponent},
{path: 'staff-filter', component: StaffFilterComponent},

{ path: 'ShowProd', component: ShowProduitsComponent },
  { path: 'ShowService', component:ShowServicePComponent  },

    { path: 'all-resourses', component: ResourcesLandingComponent },

    {
      path: 'Activities',
      children: [
          { path: ':activityId', component: KanbanActivityComponent }
      ]
  },
  { path: 'ProgramMonitoring', component: ProgramMonitoringComponent },
  { path: 'programs/:id', component: ProgramDetailComponent },



       { path: 'customers', loadChildren: () => import('./app/pages/backoffice/customers/customers.routes') },
            { path: 'services', loadChildren: () => import('./app/pages/backoffice/services/services.routes') },
            { path: 'inv', loadChildren: () => import('./app/pages/backoffice/invoices/invoice-quotations.routes') },

];

export const appRoutes: Routes = [
  { path: '', component: Landing },
  { path: 'coach-request', component: CoachRequestComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'contactlanding', component: ContactLandingComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'confirm-email', component: ConfirmEmailComponent },
 {path:'resources', component: ResourcesComponent},
  
  {
    path: '',
    component: AppLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        canActivate: [RoleGuard],
        component: DashboardRedirectComponent
      },
      {
        path: 'coach-dashboard',
        canActivate: [RoleGuard],
        data: { expectedRole: 'COACH' },
        component: CoachDashboardComponent,
      },

      {
        path: 'entrepreneur-dashboard',
        canActivate: [RoleGuard],
        data: { expectedRole: 'ENTREPRENEUR' },
        component: Dashboard,
      },
      {
        path: 'investor-dashboard',
        canActivate: [RoleGuard],
        data: { expectedRole: 'INVESTOR' },
        component: InvestorDashboardComponent,
      },
      { path: 'gestion-docs', component: GestionDocsComponent },
      { path: 'profile', component: UserProfileComponent },
      { path: 'sub-folder/:folderName/:folderMetadataId/:categoryName/:subFolderName', component: SubFolderComponent },
      { path: 'gestion-folder/folder-details/user-library/:folderName/:folderMetadataId', component: UserLibraryComponent },
      { path: 'messagerie-reclamation', component: MessagerieReclamationComponent },
      { path: 'all-coach-requests', component: AllCoachRequestsComponent },
      { path: 'all-reclamations', component: AllReclamationsComponent },
      {
        path: 'phases',
        children: [
          { path: '', component: PhaseListComponent },
          { path: ':phaseId', component: KanbanBoardComponent }
        ]
      },
      { path: 'investor/v1', loadChildren: () => import('./app/pages/startup/investorStartups/investor.routes') },
      { path: 'startup/v1', loadChildren: () => import('./app/pages/startup/StartupsRequest/startup.routes') },
      { path: 'startup/:id', loadChildren: () => import('./app/pages/marketplace/StartupDetails/startup.routes') },
      { path: 'startup-details/:id', loadChildren: () => import('./app/pages/startup/DetailsInvestment/details.routes') },
      ...pagesRoutes
    ]
  },
  { path: '', component: Landing },
  { path: 'landing', component: Landing },
  { path: 'notfound', component: Notfound },
  { path: '**', redirectTo: 'notfound' }
];