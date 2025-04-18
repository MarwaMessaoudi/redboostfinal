import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../service/UserService';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    DialogModule,
    ButtonModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  user: any = {
    firstName: '',
    lastName: '',
    profile_pictureurl: '',
    role: '',
    email: '',
    phoneNumber: '',
    specialization: '',
    yearsOfExperience: 0,
    startupName: '',
    industry: '',
    bio: ''
  };
  isLoading: boolean = true;
  editMode: string = '';
  editingName: boolean = false;
  displayEditModal: boolean = false;
  tempUserData: any = {};
  
  socialLinks = [
    { icon: 'fab fa-linkedin', delay: '0.1s', href: 'https://linkedin.com' },
    { icon: 'fab fa-twitter', delay: '0.2s', href: 'https://twitter.com' },
    { icon: 'fab fa-github', delay: '0.3s', href: 'https://github.com' }
  ];
  
  stats = [
    { currentValue: 12, label: 'Projects' },
    { currentValue: 45, label: 'Connections' },
    { currentValue: 3, label: 'Years Exp' }
  ];
  
  skills = [
    { name: 'Business Strategy', level: 85 },
    { name: 'Marketing', level: 75 },
    { name: 'Leadership', level: 90 }
  ];

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  fetchUserProfile(): void {
    this.http.get('http://localhost:8085/users/profile').subscribe({
      next: (response: any) => {
        this.user = response;
        this.userService.setUser(response);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to fetch user profile:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch user profile',
        });
        this.isLoading = false;
        this.router.navigate(['/signin']);
      },
    });
  }

  toggleNameEdit(): void {
    this.editingName = !this.editingName;
    if (!this.editingName) {
      this.saveField('firstName');
      this.saveField('lastName');
    }
  }

  hoverProfileImg(isHovering: boolean): void {
    // Implement hover effect logic if needed
  }

  openEditModal(mode: string): void {
    this.editMode = mode;
    this.tempUserData = { ...this.user };
    this.displayEditModal = true;
  }

  saveProfile(): void {
    
    const updateRequest = { ...this.tempUserData };
    
    this.http.patch('http://localhost:8085/users/updateprofile', updateRequest).subscribe({
      next: (response: any) => {
        // Update the local user object immediately
        this.user = { ...this.user, ...this.tempUserData };
        this.userService.setUser(this.user);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Profile updated successfully',
        });
        this.displayEditModal = false;
      },
      error: (error) => {
        console.error('Failed to update profile:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update profile',
        });
      },
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadProfilePicture(file);
    }
  }

  uploadProfilePicture(file: File): void {
    const formData = new FormData();
    formData.append('file', file);

    this.http.post('http://localhost:8085/users/upload', formData).subscribe({
      next: (response: any) => {
        this.user.profile_pictureurl = response.imageUrl;
        this.userService.setUser(this.user);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Profile picture updated successfully',
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update profile picture',
        });
      },
    });
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  saveField(field: string): void {
    const updateRequest = { [field]: this.user[field] };
  
    this.http.patch('http://localhost:8085/users/updateprofile', updateRequest).subscribe({
      next: (response: any) => {
        // The user object is already updated in the UI since it's two-way bound
        // Just need to update the service
        this.userService.setUser(this.user);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${field} updated successfully`,
        });
      },
      error: (error) => {
        console.error(`Failed to update ${field}:`, error);
        // Revert the UI change if the update fails
        this.user[field] = this.tempUserData[field];
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to update ${field}`,
        });
      },
    });
  }
}