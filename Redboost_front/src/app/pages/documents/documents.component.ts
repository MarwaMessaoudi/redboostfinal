import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleDriveService } from '../service/GoogleDriveService';
import { RandomImagePipe } from '../../random-image.pipe';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-google-drive',
  standalone: true,
  imports: [CommonModule, FormsModule, RandomImagePipe],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class DocumentsComponent implements OnInit {
  folderName: string = '';
  folderId: string = '';
  selectedFolder: any = null;  // Changed from selectedFolderId to selectedFolder
  selectedFile: File | null = null;
  fileId: string = '';
  folders: any[] = [];

  constructor(private googleDriveService: GoogleDriveService) {}

  ngOnInit(): void {
    this.loadFolders();
  }

  authorize() {
    this.googleDriveService.authorize();
  }

  loadFolders() {
    this.googleDriveService.getFolders().subscribe({
      next: (folders) => {
        this.folders = folders;
      },
      error: (error) => {
        console.error('Failed to load folders:', error);
      },
    });
  }

  createFolder() {
    this.googleDriveService.createFolder(this.folderName).subscribe({
      next: (folderId) => {
        this.folderId = folderId;
        this.loadFolders();
        console.log('Folder created with ID:', folderId);
      },
      error: (error) => {
        console.error('Failed to create folder:', error);
      },
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    if (!this.selectedFile || !this.selectedFolder) {
      console.error('No file selected or folder missing');
      return;
    }

    this.googleDriveService
      .uploadFile(this.selectedFolder.id, this.selectedFile.name, this.selectedFile)
      .subscribe({
        next: (fileId) => {
          this.fileId = fileId;
          console.log('File uploaded with ID:', fileId);
        },
        error: (error) => {
          console.error('Failed to upload file:', error);
        },
      });
  }

  selectFolder(folder: any) {
    this.selectedFolder = folder;
  }
}
