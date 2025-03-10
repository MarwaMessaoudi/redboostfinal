import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],

})
export class SignUpComponent {
  registerForm: FormGroup;
  submitted = signal(false);
  errorMessage = signal('');

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', Validators.required],
      role: ['', Validators.required], // Role is now bound directly via radio buttons
    });
  }

  get f() {
    return this.registerForm.controls;
  }


  // Form submit
  onSubmit() {
    this.submitted.set(true);
    if (this.registerForm.invalid) {
      return;
    }
    
    this.http.post('http://localhost:8085/Auth/register', this.registerForm.value).subscribe(
      (response: any) => {
        // Navigate to the confirmation page with the email as a query parameter
        this.router.navigate(['/confirm-email'], { queryParams: { email: this.registerForm.value.email } });
      },
      (error) => {
        this.errorMessage.set('Registration failed. Please try again.');
      }
    );
  }}