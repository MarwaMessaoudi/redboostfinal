import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentsRoutingModule } from './appointments-routing.module';
import { AppointmentsListComponent } from './appointments-list/appointments-list.component';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FullCalendarModule } from '@fullcalendar/angular';

@NgModule({
  declarations: [], // Plus rien ici, car les composants sont standalone
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    AppointmentsRoutingModule,
    HttpClientModule,
    FullCalendarModule,
    AppointmentsListComponent, // Déplacé ici
    NotificationsComponent,    // Déplacé ici
    AppointmentListComponent   // Déplacé ici
  ]
})
export class AppointmentsModule { }