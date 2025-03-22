import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-delete-appointment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay">
      <div class="modal-box">
        <div class="modal-header">
          <h4 class="modal-title">Confirmer la suppression</h4>
          <button class="btn-close" (click)="activeModal.dismiss()">✖</button>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir supprimer ce rendez-vous ?</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" (click)="activeModal.dismiss()">Annuler</button>
          <button class="btn-delete" (click)="activeModal.close('confirm')">Supprimer</button>
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
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(10px);
      z-index: 1050;
      animation: fadeIn 0.3s ease-in-out;
    }

    .modal-box {
      background: #22243D;
      color: #fff;
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
      font-size: 1.5rem;
      font-weight: 600;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #FF5252;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .btn-close:hover {
      transform: scale(1.2);
    }

    .modal-body {
      text-align: center;
      font-size: 1.1rem;
      margin: 20px 0;
    }

    .modal-footer {
      display: flex;
      justify-content: space-between;
    }

    .btn-cancel, .btn-delete {
      padding: 12px 20px;
      font-size: 1rem;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .btn-cancel {
      background: #6c757d;
      color: #fff;
    }

    .btn-cancel:hover {
      background: #5a6268;
    }

    .btn-delete {
      background: linear-gradient(45deg, #FF5252, #D32F2F);
      color: #fff;
    }

    .btn-delete:hover {
      background: linear-gradient(45deg, #D32F2F, #B71C1C);
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(255, 82, 82, 0.4);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class DeleteAppointmentModalComponent {
  @Input() appointmentId: number = 0;

  constructor(public activeModal: NgbActiveModal) {}
}
