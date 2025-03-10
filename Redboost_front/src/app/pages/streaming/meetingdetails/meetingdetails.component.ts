import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Meeting } from '../models/meeting.model';
import { User } from '../models/user.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { trigger, transition, style, animate, query, stagger, keyframes } from '@angular/animations';

@Component({
  selector: 'app-meeting-details',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogModule],
  template: `
    <mat-dialog-content class="dialog-content" @fadeSlideIn>
      <div class="dialog-header">
        <h2 class="dialog-title" @scaleIn>Détails de la Réunion</h2>
        <mat-icon class="close-icon" (click)="dialogRef.close()" @bounceIn>close</mat-icon>
      </div>

      <div class="details-container" @fadeSlideIn>
        <div *ngIf="data?.meeting" class="detail-grid">
          <div class="detail-item" *ngFor="let detail of details" @staggerIn>
            <span class="detail-label">{{ detail.label }} :</span>
            <span class="detail-value">{{ detail.value }}</span>
          </div>

          <div class="participants-section" *ngIf="data.meeting.participants && data.meeting.participants.length > 0">
            <h3 class="section-title" @scaleIn>Participants</h3>
            <ul class="participants-list">
              <li class="participant-item" *ngFor="let participant of data.meeting.participants" @fadeSlideIn>
                {{ participant.username }} ({{ participant.role }})
              </li>
            </ul>
          </div>

          <div class="notes-section" *ngIf="data.meeting.note">
            <h3 class="section-title" @scaleIn>Notes</h3>
            <p class="note-content">{{ data.meeting.note.content || 'Aucune note' }}</p>
          </div>

          <div class="record-section" *ngIf="data.meeting.record">
            <h3 class="section-title" @scaleIn>Enregistrement</h3>
            <p class="record-content">{{ data.meeting.record || 'Aucun enregistrement' }}</p>
          </div>
        </div>
        <p *ngIf="!data?.meeting" class="no-data">Aucune réunion sélectionnée ou données invalides</p>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions class="dialog-actions" @fadeSlideIn>
      <button mat-button (click)="dialogRef.close()" class="close-button" @bounceIn>Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      width: 100%;
      height: 100%;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding: 15px;
      background-color: #0A4955;
      border-radius: 8px 8px 0 0;
      color: #ffffff;

      .dialog-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
        color: #ffffff;
      }

      .close-icon {
        cursor: pointer;
        font-size: 1.5rem;
        color: #ffffff;
        transition: color 0.3s ease;

        &:hover {
          color: #EA7988;
        }
      }
    }

    .details-container {
      padding: 15px;
    }

    .detail-grid {
      display: grid;
      gap: 15px;
      max-height: 400px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      padding: 10px;
      background-color: #f5f9fb;
      border-radius: 6px;
      transition: transform 0.3s ease, background-color 0.3s ease;

      &:hover {
        transform: translateX(5px);
        background-color: #e8f0f5;
      }

      .detail-label {
        font-weight: 500;
        color: #245C67;
      }

      .detail-value {
        color: #333;
        font-size: 0.9rem;
        word-wrap: break-word;
      }
    }

    .participants-section, .notes-section, .record-section {
      padding: 15px;
      background-color: #f5f9fb;
      border-radius: 6px;
      margin-top: 15px;
      max-height: 200px;

      .section-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #0A4955;
        margin-bottom: 10px;
      }

      .participants-list {
        list-style: none;
        padding: 0;
        max-height: 150px;

        .participant-item {
          padding: 8px;
          background-color: #ffffff;
          border-radius: 4px;
          margin-bottom: 5px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;

          &:hover {
            transform: translateX(5px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
        }
      }

      .note-content, .record-content {
        font-size: 0.9rem;
        color: #333;
        line-height: 1.5;
        word-wrap: break-word;
      }
    }

    .no-data {
      color: #DB1E37;
      font-weight: 500;
      text-align: center;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      padding: 15px;
      background-color: #ffffff;
      border-top: 1px solid #e0e0e0;
      border-radius: 0 0 12px 12px;

      .close-button {
        background-color: #DB1E37;
        color: #ffffff;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s ease, transform 0.3s ease;

        &:hover {
          background-color: #E44D62;
          transform: translateY(-2px);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0.9)' }),
        animate('300ms ease-out', style({ transform: 'scale(1)' }))
      ])
    ]),
    trigger('bounceIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)' }),
        animate('300ms ease-out', keyframes([
          style({ transform: 'scale(0.8)', offset: 0 }),
          style({ transform: 'scale(1.1)', offset: 0.5 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ]),
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger(100, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class MeetingDetailsComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<MeetingDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { meeting: Meeting }
  ) {}

  ngOnInit(): void {
    console.log('Composant chargé, données reçues:', this.data.meeting);
  }

  formatDate(dateString: string | undefined | null): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  }

  get details(): { label: string, value: any }[] {
    if (!this.data?.meeting) return [];
    return [
      { label: 'Titre', value: this.data.meeting.title || 'Aucune donnée' },
      { label: 'Date de début', value: this.formatDate(this.data.meeting.startTime) },
      { label: 'Date de fin', value: this.formatDate(this.data.meeting.endTime) },
      { label: 'Capacité', value: this.data.meeting.capacity || 'N/A' },
      { label: 'Participants actuels', value: this.data.meeting.currentParticipants || 0 }
    ];
  }
}