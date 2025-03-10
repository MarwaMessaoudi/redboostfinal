import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../appointment.service';
import { RendezVous } from '../models/rendez-vous.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EditAppointmentModalComponent } from '../Formulaire/EditAppointmentComponent';
import { DeleteAppointmentModalComponent } from '../Formulaire/delete-appointment';
import { ToastrService } from 'ngx-toastr'; // ✅ Import du service Toastr

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
    private toastr: ToastrService // ✅ Injection correcte de ToastrService

  ) {
    this.editForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      date: ['', Validators.required], // Date fixe, mais non modifiable dans le modal
      heure: ['', Validators.required],
      email: ['', Validators.required],
      description: [''],
      coachId: [1] ,
      status:''// Fixé à 1, non modifiable
    });
  }

  ngOnInit(): void {

    this.loadAppointments();
  }

  loadAppointments(): void {

    this.appointmentService.getAllAppointments().subscribe({

      next: (data) => {


        this.appointments = data;
        console.log(data);


      },
      error: (error) => console.error('Erreur lors du chargement des rendez-vous :', error)
    });
  }

  openEditModal(appointment: RendezVous) {
    this.editForm.patchValue({
      id: appointment.id,
      title: appointment.title,
      date: appointment.date, // Date fixe, non modifiable
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
            coachId: 1, // Fixé à 1, non modifiable
            status: result.status
          };
          this.updateAppointment(updatedAppointment);
        }
      },
      () => {}
    );
  }

  updateAppointment(appointment: RendezVous) {
    const backendData = {
      ...appointment,
      heure: appointment.heure // Mapper heure vers heure pour le backend
    };

    this.appointmentService.updateAppointment(appointment.id!, backendData).subscribe({
      next: (response) => {
        console.log('Rendez-vous modifié avec succès :', response);
        this.toastr.success('Le Rendez Vous a ete Modifier Avec Succes  ', 'Succès'); 

        this.loadAppointments();
      },
      error: (err) => {
        console.error('Erreur lors de la modification du rendez-vous :', err);
        this.toastr.error('Échec de Modification', 'Erreur'); // ✅ Toast d'erreur

      }
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