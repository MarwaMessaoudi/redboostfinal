import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { GoogleDriveService } from '../service/GoogleDriveService';

@Component({
  selector: 'app-google-drive',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add FormsModule here
  templateUrl: './documents.component.html',
})
export class DocumentsComponent {
  folderName: string = '';
  folderId: string = '';
  uploadFolderId: string = '';
  selectedFile: File | null = null;
  fileId: string = '';

  constructor(private googleDriveService: GoogleDriveService) {}

  // Trigger Google OAuth2 authorization
  authorize(): void {
    this.googleDriveService.authorize();
  }

  // Create a folder in Google Drive
  createFolder(): void {
    if (!this.folderName) {
      alert('Folder name is required');
      return;
    }

    this.googleDriveService.createFolder(this.folderName).subscribe({
      next: (response) => {
        this.folderId = response;
        alert('Folder created successfully!');
      },
      error: (error) => {
        console.error('Error creating folder:', error);
        alert('Failed to create folder. Please try again.');
      },
    });
  }

  // Handle file selection
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  // Upload a file to Google Drive
  uploadFile(): void {
    if (!this.uploadFolderId) {
      alert('Folder ID is required');
      return;
    }
    if (!this.selectedFile) {
      alert('Please select a file');
      return;
    }

    this.googleDriveService
      .uploadFile(this.uploadFolderId, this.selectedFile.name, this.selectedFile)
      .subscribe({
        next: (response) => {
          this.fileId = response;
          alert('File uploaded successfully!');
        },
        error: (error) => {
          console.error('Error uploading file:', error);
          alert('Failed to upload file. Please try again.');
        },
      });
  }
}