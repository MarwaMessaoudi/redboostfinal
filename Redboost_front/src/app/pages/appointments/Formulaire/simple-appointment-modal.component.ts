import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentService } from '../appointment.service';
import { RendezVous } from '../models/rendez-vous.model';
import { Observable, catchError, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-appointment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Importe les modules nécessaires pour *ngIf et formGroup
  template: `
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Créer un rendez-vous</h4>
          <button type="button" class="btn-close" (click)="activeModal.dismiss('Cross click')">✖</button>
        </div>
        <div class="modal-body">
          <form [formGroup]="createForm" (ngSubmit)="onSubmit()">
            <div class="input-group">
              <input id="title" type="text" class="form-control" formControlName="title" required>
              <label for="title">Titre</label>
            </div>
            <div class="input-group">
              <input id="heure" type="time" class="form-control" formControlName="heure" (change)="checkAvailability()" required>
              <label for="heure">Heure</label>
            </div>
            <div class="input-group">
              <input id="date" type="text" class="form-control" [value]="selectedDate" readonly>
              <label for="date">Date</label>
            </div>
            <div class="input-group">
              <textarea id="description" class="form-control" formControlName="description"></textarea>
              <label for="description">Description</label>
            </div>
            <div class="input-group">
              <input id="email" type="email" class="form-control" formControlName="email" required>
              <label for="email">Email</label>
            </div>
            <div *ngIf="isHourUnavailable" class="alert alert-danger">
              Cette heure n’est pas disponible ou trop proche d’un rendez-vous existant.
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="activeModal.dismiss('Cancel')">Annuler</button>
              <button type="submit" class="btn-submit" [disabled]="createForm.invalid || isHourUnavailable">
                Créer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Nouveau design attractif */
    .modal-container {
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7); /* Fond plus sombre et opaque pour un effet dramatique */
      backdrop-filter: blur(8px); /* Plus de flou pour un effet moderne */
      z-index: 1050 !important;
      animation: fadeInBackground 0.3s ease-in-out;
    }

    @keyframes fadeInBackground {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      width: 400px; /* Augmenté pour un design plus spacieux et moderne */
      padding: 24px;
      border-radius: 16px;
      background: linear-gradient(135deg, #1e1e2f, #2d2d44); /* Dégradé sombre avec des tons profonds */
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(74, 144, 226, 0.2); /* Ombre plus prononcée avec un halo bleu */
      animation: slideIn 0.3s ease-in-out;
      z-index: 1060 !important;
      color: #ffffff; /* Texte blanc pour contraste */
    }

    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1); /* Ligne fine et discrète */
      padding-bottom: 16px;
      margin-bottom: 16px;
    }

    .modal-title {
      font-size: 1.8rem;
      font-weight: 600;
      color: #ffffff;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); /* Ombre légère pour le texte */
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #ff6b6b; /* Rouge clair pour un contraste attractif */
      cursor: pointer;
      transition: color 0.3s ease, transform 0.3s ease;
    }

    .btn-close:hover {
      color: #ff4040; /* Rouge plus foncé au hover */
      transform: scale(1.1); /* Effet d’agrandissement */
    }

    .input-group {
      position: relative;
      margin-bottom: 20px;
    }

    .input-group input, 
    .input-group textarea {
      width: 100%;
      padding: 14px 12px;
      font-size: 1rem;
      border: none;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1); /* Fond semi-transparent blanc */
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2); /* Bordure légère */
      transition: all 0.3s ease;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1); /* Ombre intérieure légère */
    }

    .input-group input:focus, 
    .input-group textarea:focus {
      outline: none;
      border-color: #4a90e2; /* Bleu vif pour le focus */
      box-shadow: 0 0 8px rgba(74, 144, 226, 0.5); /* Halo bleu au focus */
      background: rgba(255, 255, 255, 0.15); /* Fond légèrement plus clair au focus */
    }

    .input-group label {
      position: absolute;
      top: 50%;
      left: 12px;
      transform: translateY(-50%);
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.7);
      transition: 0.3s;
      pointer-events: none;
    }

    .input-group input:focus + label,
    .input-group input:not(:placeholder-shown) + label,
    .input-group textarea:focus + label,
    .input-group textarea:not(:placeholder-shown) + label {
      top: 5px;
      font-size: 0.8rem;
      color: #4a90e2; /* Bleu vif pour les labels au focus */
    }

    .input-group textarea {
      height: 100px;
      resize: vertical;
    }

    .modal-footer {
      display: flex;
      justify-content: space-between;
      padding-top: 20px;
    }

    .btn-cancel, .btn-submit {
      padding: 12px 24px;
      font-size: 1.1rem;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .btn-cancel {
      background: #ff6b6b; /* Rouge clair pour Annuler */
      color: #ffffff;
    }

    .btn-cancel:hover {
      background: #ff4040; /* Rouge plus foncé au hover */
      transform: translateY(-2px); /* Effet de levée */
      box-shadow: 0 4px 12px rgba(255, 64, 64, 0.3); /* Ombre au hover */
    }

    .btn-submit {
      background: linear-gradient(45deg, #4a90e2, #50e3c2); /* Dégradé bleu-vert attractif */
      color: #ffffff;
    }

    .btn-submit:hover {
      background: linear-gradient(45deg, #357abd, #38d9b2); /* Dégradé légèrement plus foncé au hover */
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
    }

    .btn-submit:disabled {
      background: #cccccc;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .alert-danger {
      margin-top: 10px;
      background-color: #e74c3c;
      border-color: #e74c3c;
      color: #fff;
      padding: 10px;
      border-radius: 8px;
    }
  `]
})
export class CreateAppointmentModalComponent {
  @Input() selectedDate: string = ''; // Date non modifiable passée en entrée
  @Input() coachId: number = 1; // Coach par défaut
  createForm: FormGroup;
  isHourUnavailable: boolean = false;
  acceptedAppointments: RendezVous[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private toastr: ToastrService
  ) {
    this.createForm = this.fb.group({
      title: ['', Validators.required],
      date: [{ value: this.selectedDate, disabled: true }], // Date non modifiable
      heure: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      description: [''],
      coachId: [this.coachId],
      status: ['PENDING'] // Statut par défaut
    });
  }

  checkAvailability(): void {
    const date = this.selectedDate; // Utilise la date passée en entrée
    const heure = this.createForm.get('heure')?.value;

    if (date && heure) {
      const fullDateTime = new Date(`${date}T${heure}:00`);
      this.appointmentService.getAcceptedAppointmentsByDate(date).subscribe({
        next: (appointments) => {
          this.acceptedAppointments = appointments;
          this.isHourUnavailable = this.isHourConflict(fullDateTime, appointments);
        },
        error: (error) => {
          console.error('Erreur lors de la vérification des disponibilités :', error);
          this.toastr.error('Impossible de vérifier les disponibilités. Veuillez réessayer.', 'Erreur');
          this.isHourUnavailable = true; // Bloquer par défaut en cas d'erreur
        }
      });
    }
  }

  isHourConflict(newAppointmentTime: Date, existingAppointments: RendezVous[]): boolean {
    const bufferMinutes = 45; // Plage de 45 minutes avant et après chaque rendez-vous approuvé
    return existingAppointments.some(appointment => {
      const existingTime = new Date(`${appointment.date}T${appointment.heure}:00`);
      const timeDiff = Math.abs(newAppointmentTime.getTime() - existingTime.getTime()) / 60000; // Différence en minutes
      return timeDiff < bufferMinutes || timeDiff === 0; // Conflit si même heure ou dans une plage de 45 minutes
    });
  }

  onSubmit(): void {
    if (this.createForm.valid && !this.isHourUnavailable) {
      const newAppointment: RendezVous = {
        ...this.createForm.value,
        date: this.selectedDate // Utilise la date passée en entrée
      };
      this.appointmentService.createAppointment(newAppointment).pipe(
        catchError((error) => {
          if (error.status === 400) {
            this.toastr.error('Cette heure n’est pas disponible ou trop proche d’un rendez-vous existant.', 'Erreur');
          } else {
            this.toastr.error('Échec de la création du rendez-vous', 'Erreur');
          }
          return of(null); // Gérer l'erreur sans casser l'application
        })
      ).subscribe({
        next: (response) => {
          if (response) {
            console.log('Rendez-vous créé avec succès :', response);
            this.activeModal.close(response);
            this.toastr.success('Rendez-vous créé avec succès !', 'Succès');
          }
        },
        error: (error) => console.error('Erreur inattendue lors de la création :', error)
      });
    }
  }
}