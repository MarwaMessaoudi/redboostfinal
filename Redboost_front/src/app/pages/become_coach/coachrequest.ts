import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../service/UserService'; // Adjust path as needed
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-coach-request',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  template: `
    <div class="form-container">
      <h2 class="text-3xl font-bold text-[#034A55] mb-6">Apply to Become a Coach</h2>
      <form (ngSubmit)="submitRequest()" class="space-y-6">
        <div class="input-group">
          <label for="firstName">First Name <span class="text-red-500">*</span></label>
          <input id="firstName" type="text" [(ngModel)]="firstName" name="firstName" required class="input-field" />
        </div>
        <div class="input-group">
          <label for="lastName">Last Name <span class="text-red-500">*</span></label>
          <input id="lastName" type="text" [(ngModel)]="lastName" name="lastName" required class="input-field" />
        </div>
        <div class="input-group">
          <label for="email">Email <span class="text-red-500">*</span></label>
          <input id="email" type="email" [(ngModel)]="email" name="email" required class="input-field" />
        </div>
        <div class="input-group">
          <label for="phoneNumber">Phone Number</label>
          <input id="phoneNumber" type="text" [(ngModel)]="phoneNumber" name="phoneNumber" class="input-field" />
        </div>
        <div class="input-group">
          <label for="linkedin">LinkedIn Profile</label>
          <input id="linkedin" type="text" [(ngModel)]="linkedin" name="linkedin" class="input-field" />
        </div>
        <div class="input-group">
          <label for="specialization">Specialization <span class="text-red-500">*</span></label>
          <input id="specialization" type="text" [(ngModel)]="specialization" name="specialization" required class="input-field" />
        </div>
        <div class="input-group">
          <label for="yearsOfExperience">Years of Experience <span class="text-red-500">*</span></label>
          <input id="yearsOfExperience" type="number" [(ngModel)]="yearsOfExperience" name="yearsOfExperience" required class="input-field" min="0" />
        </div>
        <button type="submit" [disabled]="!isFormValid()" class="submit-button">
          Submit Application
        </button>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 600px;
      margin: 50px auto;
      padding: 30px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .input-group {
      display: flex;
      flex-direction: column;
    }

    label {
      font-weight: 600;
      color: #034A55;
      margin-bottom: 8px;
    }

    .input-field {
      padding: 12px;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 16px;
      transition: border-color 0.3s;
    }

    .input-field:focus {
      border-color: #C8223A;
      outline: none;
    }

    .submit-button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(to right, #C8223A, #034A55);
      color: white;
      font-weight: 600;
      font-size: 16px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .submit-button:disabled {
      background: #cccccc;
      cursor: not-allowed;
    }

    .submit-button:hover:not(:disabled) {
      background: linear-gradient(to right, #034A55, #C8223A);
    }
  `]
})
export class CoachRequestComponent implements OnInit {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phoneNumber: string = '';
  linkedin: string = '';
  specialization: string = '';
  yearsOfExperience: number = 0;

  constructor(
    private userService: UserService,
    private messageService: MessageService, // Still needed if you want to keep error toasts
    private router: Router
  ) {}

  ngOnInit() {
    const currentUser = this.userService.getUser();
    if (currentUser) {
      this.firstName = currentUser.firstName || '';
      this.lastName = currentUser.lastName || '';
      this.email = currentUser.email || '';
      this.phoneNumber = currentUser.phoneNumber || '';
      this.linkedin = currentUser.linkedin || '';
    }
  }

  isFormValid(): boolean {
    return !!this.firstName && 
           !!this.lastName && 
           !!this.email && 
           !!this.specialization && 
           this.yearsOfExperience >= 0;
  }

  submitRequest() {
    const request = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      linkedin: this.linkedin,
      specialization: this.specialization,
      yearsOfExperience: this.yearsOfExperience
    };

    this.userService.submitCoachRequest(request).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Your application to become a coach has been submitted successfully. Awaiting approval.',
          confirmButtonColor: '#034A55'
        }).then(() => {
          this.router.navigate(['/landing']);
        });
      },
      error: (error) => {
        this.messageService.add({ /* ... */ });
      }
    });
  }
}