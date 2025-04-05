import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../service/UserService'; // Import UserService

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  user: any = null; // Holds the user's profile data
  isLoading: boolean = true; // Loading state
  editMode: { [key: string]: boolean } = {}; // Tracks edit mode for each field
  @ViewChild('fileInput') fileInput!: ElementRef; // Reference to the file input

  constructor(
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService,
    private userService: UserService // Inject UserService
  ) {}

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  // Fetch user profile data from the backend
  fetchUserProfile(): void {
    this.http.get('http://localhost:8085/users/profile').subscribe({
      next: (response: any) => {
        console.log('Profile data fetched successfully:', response);
        this.user = response;
        this.userService.setUser(response); // Store user data in UserService
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

  // Toggle edit mode for a specific field
  toggleEditMode(field: string): void {
    this.editMode[field] = !this.editMode[field];
  }

  // Handle file selection
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadProfilePicture(file);
    }
  }

  // Upload the profile picture to the backend
  uploadProfilePicture(file: File): void {
    const formData = new FormData();
    formData.append('file', file);

    this.http.post('http://localhost:8085/users/upload', formData).subscribe({
      next: (response: any) => {
        this.user.profile_pictureurl = response.imageUrl; // Update the user's profile picture URL
        this.userService.setUser(this.user); // Update user data in UserService
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

  // Trigger file input click event
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  // Save changes for a specific field
  saveField(field: string): void {
    const updateRequest = { [field]: this.user[field] };

    // Send the update request to the backend
    this.http.patch('http://localhost:8085/users/updateprofile', updateRequest).subscribe({
      next: (response: any) => {
        this.user = { ...this.user, ...response }; // Merge the updated fields into the user object
        this.userService.setUser(this.user); // Update user data in UserService
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${field} updated successfully`,
        });
        this.toggleEditMode(field);
      },
      error: (error) => {
        console.error(`Failed to update ${field}:`, error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to update ${field}`,
        });
      },
    });
  }
}