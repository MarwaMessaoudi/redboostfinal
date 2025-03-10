// meeting-list.component.ts
import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model'; 
import { Meeting } from '../models/meeting.model'; // Importer les interfaces
import { CommonModule } from '@angular/common'; // Importer CommonModule pour *ngFor et ngClass
import { MatIconModule } from '@angular/material/icon'; // Importer MatIconModule pour <mat-icon>
import { trigger, transition, style, animate } from '@angular/animations';
import { MeetingService } from '../services/meeting.service';
import { MeetingDetailsComponent } from '../meetingdetails/meetingdetails.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog'; // Ajouter cette ligne // Importer le service Meeting

// Interface pour les cartes
interface DashboardCard {
  icon: string; // Nom de l’icône Material (ou autre)
  title: string;
  value: number | string;
}

@Component({
  selector: 'app-meeting-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule], // Importer CommonModule et MatIconModule
  templateUrl: './meeting-list.component.html',
  styleUrls: ['./meeting-list.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('tableRowAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class MeetingListComponent implements OnInit {
  meetings: Meeting[] = []; // Initialiser comme un tableau vide
  dashboardCards: DashboardCard[] = [
    { icon: 'fa-users', title: 'Nombre de meeting', value: '0' },
    { icon: 'fa-chart-line', title: 'Statistiques', value: '4041' },
    { icon: 'fa-tasks', title: 'Tâches', value: '80' },
  ];

  constructor(private meetingService: MeetingService , private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadMeetings();
    this.loadTotalMeetingsCount(); // Charger les réunions au démarrage
  }

  loadMeetings(): void {
    const userId = 1; // Remplacez par l’ID de l’utilisateur connecté (par exemple, à partir d’un service d’authentification)
    this.meetingService.getMeetingsByParticipantId(userId).subscribe({
      next: (meetings) => {
        this.meetings = meetings;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réunions:', error);
      },
    });
  }

  loadTotalMeetingsCount(): void {
    const userId = 1; 
    this.meetingService.getTotalMeetingsCount(userId).subscribe({
      next: (count) => {
        // Mettre à jour la valeur de la première carte (New Users) avec le nombre total de réunions
        this.dashboardCards[0].value = count.toString();
      },
      error: (error) => {
        console.error('Erreur lors du chargement du nombre total de réunions:', error);
      },
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  downloadSummary(meeting: Meeting): void {
    console.log('Downloading summary for meeting:', meeting.title);
  }

  showMeetingDetails(meeting: Meeting): void {
    this.dialog.open(MeetingDetailsComponent, {
      data: { meeting }, // Passer les données de la réunion à la popup
      width: '600px',
      maxHeight: '80vh',
      panelClass: 'custom-dialog-panel' // Ajuster la largeur de la popup
    });
  }
}