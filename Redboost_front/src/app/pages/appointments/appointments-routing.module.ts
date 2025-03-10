import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { AppointmentsListComponent } from './appointments-list/appointments-list.component';
import { NotificationsComponent } from './notifications/notifications.component';

const routes: Routes = [
  { path: '', component: AppointmentListComponent },
  { path: 'mes-rendez-vous', component: AppointmentsListComponent },
  { path: 'notifications', component: NotificationsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentsRoutingModule { }