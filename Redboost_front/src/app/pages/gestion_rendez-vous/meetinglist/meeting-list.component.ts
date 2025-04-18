import { Component, OnInit } from '@angular/core';
import { RendezVous } from '../../../models/rendez-vous.model';
import { AppointmentService } from '..//../service/appointment.service';
import { AuthService } from '../../service/auth.service';
import { CommonModule } from '@angular/common';
import { MeetingDetailsPopupComponent } from '../meeting-detail-popup/meeting-detail-popup.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-meeting-list',
  templateUrl: './meeting-list.component.html',
  standalone: true,
  imports: [CommonModule , MatDialogModule, MeetingDetailsPopupComponent ],
  styleUrls: ['./meeting-list.component.scss'],
})
export class MeetingListComponent implements OnInit {
  rendezvousList: RendezVous[] = [];

  dashboardCards = [
    { icon: 'fa-calendar', title: 'Total Meetings', key: 'total', value: 0 },
    { icon: 'fa-check-circle', title: 'Completed', key: 'accepted', value: 0 },
    { icon: 'fa-hourglass-half', title: 'Pending', key: 'pending', value: 0 },
    { icon: 'fa-ban', title: 'Refused', key: 'rejected', value: 0 },
  ];
  selectedStatus: 'TOTAL' | 'PENDING' | 'ACCEPTED' | 'REJECTED' = 'TOTAL';

  selectedMeeting: RendezVous | null = null;
  isModalOpen: boolean = false;

 showModal = false;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadRendezVous();
    this.loadStats();
  }

  loadRendezVous(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user?.id) {
        this.appointmentService.getUserAppointmentHistory().subscribe({
          next: (rendezvous) => {
            this.rendezvousList = rendezvous;
          },
          error: (error) => {
            console.error('Erreur lors du chargement des rendez-vous:', error);
          },
        });
      }
    });
  }
  

  loadStats(): void {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user?.id) {
        this.appointmentService.getStats(user.id).subscribe({
          next: (stats) => {
            this.dashboardCards.forEach(card => {
              if (stats[card.key] !== undefined) {
                card.value = stats[card.key];
              }
            });
          },
          error: (error) => {
            console.error('Erreur lors du chargement des stats:', error);
          }
        });
      }
    });
  }


  openDetailsPopup(RendezVous: RendezVous): void {
    this.dialog.open(MeetingDetailsPopupComponent, {
      data: { RendezVous },
      width: '600px',
      maxHeight: '80vh',
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString(); // à personnaliser
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedMeeting = null;
  }


  filterByStatus(status: string): void {
    this.selectedStatus = status as any;
  
    this.authService.getCurrentUser().subscribe((user) => {
      if (user?.id) {
        this.appointmentService.getUserAppointmentHistory().subscribe({
          next: (rendezvous) => {
            if (status === 'TOTAL') {
              this.rendezvousList = rendezvous;
            } else {
              this.rendezvousList = rendezvous.filter(r => r.status === status);
            }
          },
          error: (error) => {
            console.error('Erreur lors du filtrage des rendez-vous:', error);
          },
        });
      }
    });
  }

  
}
