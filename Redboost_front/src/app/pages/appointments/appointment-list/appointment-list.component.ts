import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CoachService } from '../coach.service';
import { AppointmentsListComponent } from '../appointments-list/appointments-list.component'; 
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateAppointmentModalComponent } from '../Formulaire/simple-appointment-modal.component';import { AppointmentService } from '../appointment.service';
import { RendezVous } from '../models/rendez-vous.model';

interface Coach {
  id: number;
  name: string;
  specialty: string;
  availability: string;
  avatar: string;
}

@Component({
  selector: 'app-appointments-appointment-list',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, AppointmentsListComponent],
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss']
})
export class AppointmentListComponent implements OnInit {
  coaches: Coach[] = [];
  selectedMonth = new Date();

  coachCalendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    headerToolbar: false,
    height: 'auto',
    events: [],
    dateClick: this.handleDateClick.bind(this)
  };

  entrepreneurCalendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    events: [],
    dateClick: this.handleDateClick.bind(this)
  };

  constructor(
    private coachService: CoachService,
    private modalService: NgbModal,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit() {
    this.loadCoaches();
    this.syncCalendarsWithApprovedAppointments(); // Synchroniser les calendriers avec les rendez-vous approuvés au chargement
  }

  loadCoaches() {
    this.coachService.getCoaches().subscribe({
      next: (data) => {
        this.coaches = data.map(coach => ({
          id: coach.id,
          name: `${coach.firstName} ${coach.lastName}`,
          specialty: coach.speciality,
          availability: coach.isAvailable ? 'Disponible aujourd\'hui' : 'Non disponible',
          avatar: `assets/images/faces/${coach.id}.jpg`
        }));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des coachs :', err);
      }
    });
  }

  handleDateClick(arg: any) {
    const modalRef = this.modalService.open(CreateAppointmentModalComponent, {
      centered: true,
      size: 'sm',
      backdrop: true,
      keyboard: true
    });
    modalRef.componentInstance.selectedDate = arg.dateStr;
    modalRef.result.then(
      (result: RendezVous) => {
        if (result) {
          this.addAppointmentToBackendOnly(arg.dateStr, result); // Créer uniquement dans le backend sans ajouter aux calendriers
        }
      },
      () => {}
    );
  }

  addAppointmentToBackendOnly(selectedDate: string, rendezVous: RendezVous) {
    if (!rendezVous.heure) {
      console.error('Le champ Heure est requis');
      return;
    }

    const appointmentData: RendezVous = {
      title: rendezVous.title,
      heure: rendezVous.heure,
      description: rendezVous.description,
      email: rendezVous.email || 'user@example.com',
      date: selectedDate,
      coachId: 1, 
      status: 'PENDING' // Statut initial 'PENDING' par défaut
    };

    // Mapper "heure" à "heure" pour le backend
    const backendData = {
      ...appointmentData,
      heure: appointmentData.heure // Ajoute "heure" avec la valeur de "heure"
    };

    this.appointmentService.createAppointment(backendData).subscribe({
      next: (response) => {
        console.log('Rendez-vous créé avec succès dans la base de données avec statut PENDING :', response);
        // Ne pas ajouter l'événement aux calendriers ici
      },
      error: (err) => {
        console.error('Erreur lors de la création du rendez-vous dans la base de données :', err);
      }
    });
  }

  // Méthode pour synchroniser les calendriers avec les rendez-vous approuvés
  private syncCalendarsWithApprovedAppointments() {
    this.appointmentService.getAllAppointments().subscribe({
      next: (data) => {
        const approvedAppointments = data.filter(appointment => appointment.status === 'ACCEPTED' && appointment.coachId === 1);
        const coachEvents = approvedAppointments.map(appointment => ({
          title: `${appointment.title} (Approuvé)`,
          date: `${appointment.date}T${appointment.heure}`,
          extendedProps: { coachId: appointment.coachId, status: appointment.status }
        }));
        const entrepreneurEvents = approvedAppointments.map(appointment => ({
          title: `${appointment.title} (Approuvé)`,
          date: `${appointment.date}T${appointment.heure}`,
          extendedProps: { coachId: appointment.coachId, status: appointment.status }
        }));

        // Mettre à jour les événements dans les calendriers
        this.coachCalendarOptions.events = coachEvents;
        this.entrepreneurCalendarOptions.events = entrepreneurEvents;
      },
      error: (err) => {
        console.error('Erreur lors de la synchronisation des calendriers :', err);
      }
    });
  }

  // Ajouter une méthode pour forcer la synchronisation manuelle (optionnel, peut être appelé après une approbation)
  public refreshCalendars() {
    this.syncCalendarsWithApprovedAppointments();
  }

  discoverCoach(coach: Coach) {
    console.log('Découvrir le coach :', coach.name);
  }

  reserveCoach(coach: Coach) {
    console.log('Réserver le coach :', coach.name);
  }
}