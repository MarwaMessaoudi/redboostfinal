import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../service/appointment.service';
import { RendezVous } from '../../../models/rendez-vous.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EditAppointmentModalComponent } from '../Formulaire/EditAppointmentComponent';
import { DeleteAppointmentModalComponent } from '../Formulaire/delete-appointment';
import { ToastrService } from 'ngx-toastr'; // ✅ Import du service Toastr
import { AuthService } from '../../service/auth.service'; // Ajuste le chemin si nécessaire

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule],
  templateUrl: './appointments-list.component.html',
  styleUrls: ['./appointments-list.component.scss']
})
export class AppointmentsListComponent implements OnInit {
  appointments: RendezVous[] = [];
  editForm: FormGroup;

  constructor(
    private appointmentService: AppointmentService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private toastr: ToastrService ,
    private authService: AuthService // Injection correcte de AuthService// ✅ Injection correcte de ToastrService

  ) {
    this.editForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      date: ['', Validators.required], // Date fixe, mais non modifiable dans le modal
      heure: ['', Validators.required],
      email: ['', Validators.required],
      description: [''],
      status:'PENDING'// Fixé à 1, non modifiable
    });
  }

  ngOnInit(): void {
    this.loadAppointments();
  }
  
  loadAppointments(): void {
    const userId = this.authService.getUserId();
  
    this.appointmentService.getRendezVousByEntrepreneurId(Number(userId)).subscribe({
      next: (appointments) => {
        this.appointments = appointments; // Assigner les données à this.appointments
      },
    })}
  

  openEditModal(appointment: RendezVous) {
    this.editForm.patchValue({
      id: appointment.id,
      title: appointment.title,
      date: appointment.date, 
      heure: appointment.heure,
      email: appointment.email || '',
      description: appointment.description || ''
    });

    const modalRef = this.modalService.open(EditAppointmentModalComponent, {
      centered: true,
      size: 'md',
      backdrop: 'static',
      keyboard: true
    });

    modalRef.componentInstance.form = this.editForm;

    modalRef.result.then(
      (result: any) => { // Changé en `any` pour accepter le format simplifié du modal
        if (result) {
          const updatedAppointment: RendezVous = {
            id: appointment.id,
            title: result.title,
            date: appointment.date, // Date conservée sans modification
            heure: result.heure,
            email: result.email,
            description: result.description,
            status: result.status
          };
          this.updateAppointment(updatedAppointment);
        }
      },
      () => {}
    );
  }
  updateAppointment(appointment: RendezVous) {
    this.appointmentService.updateAppointment(appointment.id!, appointment).subscribe({
      next: (response) => {
        console.log('Rendez-vous modifié avec succès :', response);
        this.toastr.success('Le rendez-vous a été modifié avec succès', 'Succès');
        this.loadAppointments();
      },
      error: (err) => {
        console.error('Erreur lors de la modification du rendez-vous :', err);
        this.toastr.error('Échec de la modification', 'Erreur');
      },
    });
  }
  openDeleteModal(appointmentId: number) {
    const modalRef = this.modalService.open(DeleteAppointmentModalComponent, {
      centered: true,
      size: 'md',
      backdrop: 'static',
      keyboard: true
    });

    modalRef.componentInstance.appointmentId = appointmentId;

    modalRef.result.then(
      (result: string) => {
        if (result === 'confirm') {
          this.deleteAppointment(appointmentId);
        }
      },
      () => {}
    );
  }

  deleteAppointment(id: number) {
    this.appointmentService.deleteAppointment(id).subscribe({
      next: () => {
        console.log('Rendez-vous supprimé avec succès !');
        this.toastr.success('Rendez-vous supprimé avec succès ! ', 'Succès'); 

        this.loadAppointments();
      },
      error: (err) => {
        console.error('Erreur lors de la suppression :', err);
        this.toastr.success('Erreur lors de la suppression   ', 'Erreur'); 

      }
    });
  }
}