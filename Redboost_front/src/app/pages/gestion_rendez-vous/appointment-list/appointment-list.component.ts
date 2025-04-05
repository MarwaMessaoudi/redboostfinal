import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoachService } from '../coach.service';
import { AppointmentsListComponent } from '../appointments-list/appointments-list.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateAppointmentModalComponent } from '../Formulaire/simple-appointment-modal.component';
import { AppointmentService } from '../../service/appointment.service';
import { RendezVous } from '../../../models/rendez-vous.model';
import { ToastrService } from 'ngx-toastr';
import { catchError, of } from 'rxjs';
import { Router } from '@angular/router';


interface Coach {
  id: number;
  name: string;
  specialty: string;
  avatar: string;
  email: string;
  phoneNumber: string;
}

@Component({
  selector: 'app-appointments-appointment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AppointmentsListComponent],
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss'],
})
export class AppointmentListComponent implements OnInit {
  coaches: Coach[] = [];
  filteredCoaches: Coach[] = [];
  searchTerm: string = '';
  selectedMonth = new Date();
  private isSubmitting: boolean = false; // Protection contre les doubles soumissions

  // Commenté : Options du calendrier (non utilisé actuellement)
  /*
  coachCalendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    headerToolbar: false,
    height: 'auto',
    events: [],
    dateClick: this.handleDateClick.bind(this),
  };

  entrepreneurCalendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek',
    },
    events: [],
    dateClick: this.handleDateClick.bind(this),
  };
  */

  constructor(
    private coachService: CoachService,
    private modalService: NgbModal,
    private appointmentService: AppointmentService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCoaches();
    // Commenté : Synchronisation des calendriers (non utilisé actuellement)
    // this.syncCalendarsWithApprovedAppointments();
  }

  loadCoaches() {
    this.coachService.getCoaches().subscribe({
      next: (data) => {
        this.coaches = data.map(coach => ({
          phoneNumber: coach.phoneNumber,
          id: coach.id,
          name: `${coach.firstName} ${coach.lastName}`,
          specialty: coach.specialization || 'Unknown',
          avatar: `assets/images/faces/${coach.id}.jpg`,
          email: coach.email,
        }));
        this.filteredCoaches = [...this.coaches];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des coachs :', err);
      },
    });
  }

  filterCoaches() {
    if (!this.searchTerm) {
      this.filteredCoaches = [...this.coaches];
    } else {
      this.filteredCoaches = this.coaches.filter(coach =>
        coach.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  // Commenté : Gestion du clic sur une date dans le calendrier (non utilisé actuellement)
  /*
  handleDateClick(arg: any) {
    const modalRef = this.modalService.open(CreateAppointmentModalComponent, {
      centered: true,
      size: 'sm',
      backdrop: true,
      keyboard: true,
    });
    modalRef.componentInstance.selectedDate = arg.dateStr;
    modalRef.result.then(
      (result: RendezVous) => {
        if (result) {
          this.addAppointmentToBackendOnly(arg.dateStr, result);
        }
      },
      () => {}
    );
  }
  */

  addAppointmentToBackendOnly(selectedDate: string, rendezVous: RendezVous) {
    if (!rendezVous.heure) {
      this.toastr.error('Le champ Heure est requis.', 'Erreur');
      return;
    }

    const appointmentData: RendezVous = {
      title: rendezVous.title,
      heure: rendezVous.heure,
      description: rendezVous.description,
      email: rendezVous.email || 'user@example.com',
      date: selectedDate,
      status: 'PENDING',
    };

    console.log('AppointmentList - Données avant création :', appointmentData);

    this.appointmentService.createAppointment(appointmentData, this.getSelectedCoachId()).pipe(
      catchError((error) => {
        console.error('AppointmentList - Erreur lors de la création :', error);
        this.toastr.error(
          'Échec de la création du rendez-vous : ' + (error.message || 'Erreur inconnue'),
          'Erreur'
        );
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          console.log('Rendez-vous créé avec succès dans la base de données avec statut PENDING :', response);
          this.toastr.success('Rendez-vous créé avec succès !', 'Succès');
          // Commenté : Synchronisation des calendriers (non utilisé actuellement)
          // this.syncCalendarsWithApprovedAppointments();
        }
      },
      error: (error) => console.error('AppointmentList - Erreur inattendue :', error),
    });
  }

  private getSelectedCoachId(): number | undefined {
    return this.coaches.length > 0 ? this.coaches[0].id : undefined;
  }

  // Commenté : Synchronisation des calendriers avec les rendez-vous approuvés (non utilisé actuellement)
  /*
  private syncCalendarsWithApprovedAppointments() {
    this.appointmentService.getAllAppointments().subscribe({
      next: (data) => {
        const approvedAppointments = data.filter(appointment => appointment.status === 'ACCEPTED');
        const coachEvents = approvedAppointments.map(appointment => ({
          title: `${appointment.title} (Approuvé)`,
          date: `${appointment.date}T${appointment.heure}`,
          extendedProps: { coachId: appointment.coachId, status: appointment.status },
        }));
        const entrepreneurEvents = approvedAppointments.map(appointment => ({
          title: `${appointment.title} (Approuvé)`,
          date: `${appointment.date}T${appointment.heure}`,
          extendedProps: { coachId: appointment.coachId, status: appointment.status },
        }));

        this.coachCalendarOptions.events = coachEvents;
        this.entrepreneurCalendarOptions.events = entrepreneurEvents;
      },
      error: (err) => {
        console.error('Erreur lors de la synchronisation des calendriers :', err);
      },
    });
  }
  */

  // Commenté : Rafraîchissement des calendriers (non utilisé actuellement)
  /*
  public refreshCalendars() {
    this.syncCalendarsWithApprovedAppointments();
  }
  */

  discoverCoach(coach: Coach) {
    this.router.navigate(['/profile', coach.id]);
  }


  reserveCoach(coach: Coach) {
    if (this.isSubmitting) return; // Empêche les doubles soumissions
    this.isSubmitting = true;
    console.log('Coach sélectionné, ID :', coach.id);
    const modalRef = this.modalService.open(CreateAppointmentModalComponent, {
      centered: true,
      size: 'sm',
      backdrop: true,
      keyboard: true,
    });
    modalRef.componentInstance.coachId = coach.id;

  }
}