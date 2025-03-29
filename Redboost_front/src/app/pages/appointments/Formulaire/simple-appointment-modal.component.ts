import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentService } from '../appointment.service';
import { RendezVous } from '../models/rendez-vous.model';
import { catchError, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-appointment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Créer un rendez-vous</h4>
        </div>
        <div class="modal-body">
          <form [formGroup]="createForm" (ngSubmit)="onSubmit()">
            <div class="input-group">
              <label for="title">Titre <span class="required">*</span></label>
              <input id="title" type="text" class="form-control" formControlName="title" required>
            </div>
            <div class="input-row">
              <div class="input-group half">
                <label for="date">Date <span class="required">*</span></label>
                <div class="input-with-icon">
                  <input id="date" type="date" class="form-control" formControlName="date" required>
                </div>
              </div>
              <div class="input-group half">
                <label for="heure">Heure <span class="required">*</span></label>
                <div class="input-with-icon">
                  <input id="heure" type="time" class="form-control" formControlName="heure" (change)="checkAvailability()" required>
     
                </div>
              </div>
            </div>
            <div class="input-group">
              <label for="email">Email <span class="required">*</span></label>
              <input id="email" type="email" class="form-control" formControlName="email" required>
            </div>
            <div class="input-group">
              <label for="description">Description</label>
              <textarea id="description" class="form-control" formControlName="description"></textarea>
            </div>
            <div *ngIf="isHourUnavailable" class="alert alert-danger">
              Cette heure n’est pas disponible ou trop proche d’un rendez-vous existant.
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="activeModal.dismiss('Cancel')">Annuler</button>
              <button type="submit" class="btn-submit" [disabled]="createForm.invalid || isHourUnavailable || isSubmitting">
                Créer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-container {
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      z-index: 1050 !important;
    }

    .modal-content {
      width: 600px;
      background: #f5f7fa;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      z-index: 1060 !important;
      color: #333;
    }

    .modal-header {
      padding: 20px 30px;
      border-bottom: none;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a3c34;
      margin: 0;
    }

    .modal-body {
      padding: 20px 30px;
    }

    .input-group {
      margin-bottom: 20px;
    }

    .input-row {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }

    .half {
      flex: 1;
    }

    .input-group label {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 5px;
      display: block;
    }

    .required {
      color: #ff0000;
      font-size: 0.9rem;
    }

    .input-group input,
    .input-group textarea {
      width: 100%;
      padding: 10px 15px;
      font-size: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 5px;
      background: #fff;
      color: #333;
      transition: border-color 0.3s ease;
    }

    .input-group input:focus,
    .input-group textarea:focus {
      outline: none;
      border-color: #1a73e8;
    }

    .input-group textarea {
      height: 80px;
      resize: vertical;
    }

    .input-with-icon {
      position: relative;

    }

    .input-with-icon input {
      padding-right: 40px;
    }

    .calendar-icon {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #666;
      font-size: 1.2rem;
    }

    .calendar-icon svg {
      display: block;
    }

    .alert-danger {
      margin-top: 10px;
      background-color: rgba(255, 0, 0, 0.1);
      border: 1px solid #ff0000;
      color: #ff0000;
      padding: 10px;
      border-radius: 5px;
      font-size: 0.9rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 20px 30px;
      border-top: none;
    }

    .btn-cancel,
    .btn-submit {
      padding: 10px 20px;
      font-size: 1rem;
      border-radius: 5px;
      border: none;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .btn-cancel {
      background: transparent;
      color: #666;
      border: 1px solid #e0e0e0;
    }

    .btn-cancel:hover {
      background: #e0e0e0;
    }

    .btn-submit {
      background: #1a73e8;
      color: #fff;
    }

    .btn-submit:hover {
      background: #1557b0;
    }

    .btn-submit:disabled {
      background: #b0c4de;
      cursor: not-allowed;
    }
  `]
})
export class CreateAppointmentModalComponent implements OnInit {
  @Input() coachId?: number;
  createForm!: FormGroup;
  isHourUnavailable: boolean = false;
  acceptedAppointments: RendezVous[] = [];
  isSubmitting: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.createForm = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      heure: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      description: [''],
      status: ['PENDING'],
    });
  }

  checkAvailability(): void {
    const date = this.createForm.get('date')?.value;
    const heure = this.createForm.get('heure')?.value;

    if (date && heure) {
      const fullDateTime = new Date(`${date}T${heure}:00`);
      this.appointmentService.getAcceptedAppointmentsByDate(date).subscribe({
        next: (appointments) => {
          this.acceptedAppointments = appointments || [];
          this.isHourUnavailable = this.isHourConflict(fullDateTime, this.acceptedAppointments);
        },
        error: (error) => {
          this.toastr.error('Impossible de vérifier les disponibilités. Veuillez réessayer.', 'Erreur');
          this.isHourUnavailable = true;
          this.acceptedAppointments = [];
        },
      });
    }
  }

  isHourConflict(newAppointmentTime: Date, existingAppointments: RendezVous[]): boolean {
    if (!Array.isArray(existingAppointments)) {
      return false;
    }
    const bufferMinutes = 45;
    return existingAppointments.some(appointment => {
      if (!appointment.date || !appointment.heure) return false;
      const existingTime = new Date(`${appointment.date}T${appointment.heure}:00`);
      const timeDiff = Math.abs(newAppointmentTime.getTime() - existingTime.getTime()) / 60000;
      return timeDiff < bufferMinutes || timeDiff === 0;
    });
  }

  onSubmit(): void {
    if (this.createForm.valid && !this.isHourUnavailable && !this.isSubmitting) {
      this.isSubmitting = true;
      const newAppointment: RendezVous = {
        ...this.createForm.value,
      };
      if (!this.coachId) {
        this.toastr.error('Aucun coach sélectionné.', 'Erreur');
        this.isSubmitting = false;
        return;
      }
      this.appointmentService.createAppointment(newAppointment, this.coachId).pipe(
        catchError((error) => {
          if (error.status === 400) {
            this.toastr.error('Cette heure n’est pas disponible ou trop proche d’un rendez-vous existant.', 'Erreur');
          } else {
            this.toastr.error('Échec de la création du rendez-vous : ' + (error.message || 'Erreur inconnue'), 'Erreur');
          }
          this.isSubmitting = false;
          return of(null);
        })
      ).subscribe({
        next: (response) => {
          if (response) {
            this.activeModal.close(response);
            this.toastr.success('Rendez-vous créé avec succès !', 'Succès');
          }
          this.isSubmitting = false;
        },
      });
    }
  }
}