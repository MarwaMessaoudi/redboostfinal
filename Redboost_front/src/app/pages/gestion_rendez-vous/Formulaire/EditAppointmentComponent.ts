import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-edit-appointment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-container">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Modifier le rendez-vous</h4>
        </div>
        <div class="modal-body">
          <form [formGroup]="form" (ngSubmit)="onSave()">
            <div class="input-group">
              <label for="title">Titre <span class="required">*</span></label>
              <input id="title" type="text" class="form-control" formControlName="title" required>
            </div>
            <div class="input-row">
              
              <div class="input-group half">
                <label for="heure">Heure <span class="required">*</span></label>
                <div class="input-with-icon">
                  <span class="calendar-icon">
                    
                  </span>
                  <input id="heure" type="time" class="form-control" formControlName="heure" required>
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
      padding: 10px 15px 10px 40px; /* Ajout de padding à gauche pour l'icône */
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
      padding: 10px 15px; /* Pas d'icône pour textarea, donc padding normal */
      height: 80px;
      resize: vertical;
    }

    .input-with-icon {
      position: relative;
    }

   

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 20px 30px;
      border-top: none;
    }

    .btn-cancel,
    .btn-save {
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

    .btn-save {
      background: #1a73e8;
      color: #fff;
    }

    .btn-save:hover {
      background: #1557b0;
    }

    .btn-save:disabled {
      background: #b0c4de;
      cursor: not-allowed;
    }
  `]
})
export class EditAppointmentModalComponent {
  @Input() form: FormGroup = new FormGroup({});

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder) {}

  onSave() {
    if (this.form.valid) {
      const updatedAppointment = this.form.value;
      this.activeModal.close(updatedAppointment);
    }
  }
}