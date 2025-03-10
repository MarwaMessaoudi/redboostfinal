import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-edit-appointment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay">
      <div class="modal-box">
        <div class="modal-header">
          <h4 class="modal-title">Modifier le rendez-vous</h4>
          <button class="btn-close" (click)="activeModal.dismiss()">✖</button>
        </div>
        <div class="modal-body">
          <form [formGroup]="form" (ngSubmit)="onSave()">
            <div class="input-group">
              <label for="title">Titre</label>
              <input id="title" formControlName="title" type="text" required>
            </div>
            <div class="input-group">
              <label for="time">Heure</label>
              <input id="time" formControlName="time" type="time" required>
            </div>
            <div class="input-group">
              <label for="description">Description</label>
              <textarea id="description" formControlName="description"></textarea>
            </div>
            <div class="input-group">
              <label for="email">Email</label>
              <input id="email" formControlName="email" type="email" required>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="activeModal.dismiss()">Annuler</button>
              <button type="submit" class="btn-save" [disabled]="form.invalid">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      z-index: 1050;
      animation: fadeInBackground 0.3s ease-in-out;
    }

    .modal-box {
      background: #1E1F2F;
      color: #ffffff;
      width: 420px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      padding: 24px;
      animation: slideIn 0.3s ease-in-out;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 16px;
      margin-bottom: 16px;
    }

    .modal-title {
      font-size: 1.8rem;
      font-weight: 600;
      color: #ffffff;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #ff6b6b;
      cursor: pointer;
      transition: color 0.3s ease, transform 0.3s ease;
    }

    .btn-close:hover {
      color: #ff4040;
      transform: scale(1.1);
    }

    .input-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 16px;
    }

    .input-group label {
      font-size: 1rem;
      margin-bottom: 5px;
      color: rgba(255, 255, 255, 0.8);
    }

    .input-group input,
    .input-group textarea {
      width: 100%;
      padding: 10px;
      font-size: 1rem;
      border: none;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .input-group input:focus,
    .input-group textarea:focus {
      outline: none;
      border-color: #4a90e2;
      box-shadow: 0 0 8px rgba(74, 144, 226, 0.5);
      background: rgba(255, 255, 255, 0.15);
    }

    .input-group textarea {
      height: 80px;
      resize: vertical;
    }

    .modal-footer {
      display: flex;
      justify-content: space-between;
      padding-top: 20px;
    }

    .btn-cancel, .btn-save {
      padding: 12px 24px;
      font-size: 1.1rem;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .btn-cancel {
      background: #6c757d;
      color: #ffffff;
    }

    .btn-cancel:hover {
      background: #5a6268;
    }

    .btn-save {
      background: linear-gradient(45deg, #4a90e2, #50e3c2);
      color: #ffffff;
    }

    .btn-save:hover {
      background: linear-gradient(45deg, #357abd, #38d9b2);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
    }

    .btn-save:disabled {
      background: #cccccc;
      cursor: not-allowed;
      opacity: 0.7;
    }

    @keyframes fadeInBackground {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class EditAppointmentModalComponent {
  @Input() form: FormGroup = new FormGroup({});

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder) {
    // Initialisation du formulaire avec les champs modifiables et coachId fixe à 1
    this.form = this.fb.group({
      title: [''],
      time: [''],
      description: [''],
      email: ['']
    });
  }

  onSave() {
    if (this.form.valid) {
      const updatedAppointment = {
        ...this.form.value,
        date: '', // La date sera fixée dans AppointmentsListComponent
        coachId: 1 // CoachId fixe et non visible
      };
      this.activeModal.close(updatedAppointment);
    }
  }
}