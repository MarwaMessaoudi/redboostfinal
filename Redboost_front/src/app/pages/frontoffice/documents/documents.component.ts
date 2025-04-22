import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleDriveService } from '../service/GoogleDriveService';
import { RandomImagePipe } from '../../../random-image.pipe';
import { trigger, state, style, animate, transition, stagger, query, keyframes } from '@angular/animations';

@Component({
    selector: 'app-google-drive',
    standalone: true,
    imports: [CommonModule, FormsModule, RandomImagePipe],
    templateUrl: './documents.component.html',
    styleUrls: ['./documents.component.scss'],
    animations: [
        trigger('fadeIn', [transition(':enter', [style({ opacity: 0, transform: 'translateY(10px)' }), animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))])]),
        trigger('staggerIn', [transition('* => *', [query(':enter', [style({ opacity: 0, transform: 'translateY(15px)' }), stagger('100ms', [animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))])], { optional: true })])]),
        trigger('hoverScale', [
            state('default', style({ transform: 'scale(1)', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' })),
            state('hovered', style({ transform: 'scale(1.03)', boxShadow: '0 6px 15px rgba(0,0,0,0.15)' })),
            transition('default <=> hovered', animate('300ms ease-out'))
        ]),
        trigger('buttonClick', [
            transition('* => clicked', [
                animate('600ms ease-out', keyframes([style({ transform: 'scale(1)', offset: 0 }), style({ transform: 'scale(0.95)', offset: 0.3 }), style({ transform: 'scale(1.05)', offset: 0.7 }), style({ transform: 'scale(1)', offset: 1.0 })]))
            ])
        ]),
        trigger('inputFocus', [
            state('focused', style({ borderColor: '#568086', boxShadow: '0 0 0 4px rgba(86, 128, 134, 0.2)' })),
            state('blurred', style({ borderColor: 'rgba(0, 0, 0, 0.08)', boxShadow: 'none' })),
            transition('blurred <=> focused', animate('300ms ease-out'))
        ])
    ]
})
export class DocumentsComponent implements OnInit {
    folderName: string = '';
    subFolderName: string = '';
    selectedFolder: any = null;
    selectedFile: File | null = null;
    folders: any[] = [];
    userId: number | null = null;
    successMessage: string | null = null;
    fileName: string = '';
    subFolders: any[] = [];
    isCreatingFolder: boolean = false;
    isCreatingSubFolder: boolean = false;
    isUploadingFile: boolean = false;
    folderInputFocused: boolean = false; // Track focus state for folder input
    subFolderInputFocused: boolean = false; // Track focus state for subfolder input

    constructor(private googleDriveService: GoogleDriveService) {}

    ngOnInit(): void {
        this.userId = this.googleDriveService.getCurrentUserId();
        if (this.userId) {
            this.loadFolders();
        } else {
            console.error('User ID not found - please log in');
        }
    }

    onHover(item: any) {
        item.isHovered = true;
    }

    onLeave(item: any) {
        item.isHovered = false;
    }

    goBack() {
        this.selectedFolder = null;
        this.subFolders = [];
    }

    handleFileDrop(event: DragEvent) {
        event.preventDefault();
        if (event.dataTransfer?.files) {
            this.selectedFile = event.dataTransfer.files[0];
            this.fileName = this.selectedFile?.name || '';
        }
    }

    authorize() {
        this.googleDriveService.authorize();
    }

    loadFolders() {
        if (!this.userId) return;

        this.googleDriveService.getFolders(this.userId).subscribe({
            next: (folders) => {
                this.folders = folders.map((folder) => ({ ...folder, isHovered: false }));
            },
            error: (error) => {
                console.error('Failed to load folders:', error);
            }
        });
    }

    selectFolder(folder: any) {
        this.selectedFolder = folder;
        this.loadSubFolders(folder.id);
    }

    loadSubFolders(parentFolderId: string) {
        if (!this.userId || !parentFolderId) {
            console.error('User ID or Parent Folder ID missing');
            return;
        }

        this.googleDriveService.getSubFolders(parentFolderId, this.userId).subscribe({
            next: (subFolders) => {
                this.subFolders = subFolders.map((subFolder) => ({ ...subFolder, isHovered: false }));
            },
            error: (error) => {
                console.error('Failed to load subfolders:', error);
                this.subFolders = [];
            }
        });
    }

    createFolder() {
        if (!this.userId) return;
        this.isCreatingFolder = true;

        this.googleDriveService.createFolder(this.folderName, this.userId).subscribe({
            next: () => {
                this.folderName = '';
                this.showSuccess('Folder created successfully!');
                this.loadFolders();
                this.isCreatingFolder = false;
            },
            error: (error) => {
                console.error('Failed to create folder:', error);
                this.isCreatingFolder = false;
            }
        });
    }

    createSubFolder() {
        if (!this.userId || !this.selectedFolder) return;
        this.isCreatingSubFolder = true;

        this.googleDriveService.createSubFolder(this.selectedFolder.id, this.subFolderName, this.userId).subscribe({
            next: () => {
                this.subFolderName = '';
                this.showSuccess('Subfolder created successfully!');
                this.loadSubFolders(this.selectedFolder.id);
                this.isCreatingSubFolder = false;
            },
            error: (error) => {
                console.error('Failed to create subfolder:', error);
                this.isCreatingSubFolder = false;
            }
        });
    }

    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0];
        this.fileName = this.selectedFile?.name || '';
    }

    uploadFile() {
        if (!this.userId || !this.selectedFile || !this.selectedFolder) return;
        this.isUploadingFile = true;

        this.googleDriveService.uploadFile(this.selectedFolder.id, this.selectedFile, this.userId).subscribe({
            next: () => {
                this.selectedFile = null;
                this.fileName = '';
                this.showSuccess('File uploaded successfully!');
                const fileInput = document.getElementById('fileInput') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
                this.loadSubFolders(this.selectedFolder.id);
                this.isUploadingFile = false;
            },
            error: (error) => {
                console.error('Failed to upload file:', error);
                this.isUploadingFile = false;
            }
        });
    }

    private showSuccess(message: string) {
        this.successMessage = message;
        setTimeout(() => {
            this.successMessage = null;
        }, 3000);
    }
}
