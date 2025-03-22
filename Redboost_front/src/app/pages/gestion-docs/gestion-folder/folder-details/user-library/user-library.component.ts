import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FolderService } from '../../../../service/folder.service';
import { SubFolderService } from '../../../../service/subfolder.service';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Folder } from '../../../../../models/folder.model';
import { SubFolder } from '../../../../../models/subfolder.model';
import { CategoryService } from '../../../../service/category.service';
import { Category } from '../../../../../models/category.model';
import { RandomImagePipe } from '../../../../../random-image.pipe'; // Import the pipe

interface FileInfo {
    name: string;
    size: number;
    type: string;
}

interface BreadcrumbItem {
    label: string;
    url?: string; // Optional: If it's not the last item, include a URL
}

@Component({
    selector: 'app-user-library',
    standalone: true,
    imports: [HttpClientModule, CommonModule, RouterLink, FormsModule, ReactiveFormsModule, RandomImagePipe], // Add RandomImagePipe to imports
    templateUrl: './user-library.component.html',
    styleUrls: ['./user-library.component.scss']
})
export class UserLibraryComponent implements OnInit {
    folderName: string | null = null;
    folderMetadataId: number | null = null;
    isLoaded = false;
    selectedFiles: FileList | null = null;
    uploadProgress: number = 0;
    showForm = false;  // Control the popup visibility
    folderForm: FormGroup;
    categories: Category[] = [];
    subFolders: SubFolder[] = [];
    fileList: FileInfo[] = [];
    categoryName: string | null = null;  // Add this
    subFolderName: string | null = null;
    uploadError: string | null = null; // Add this line!

    breadcrumbs: BreadcrumbItem[] = []; // Add breadcrumbs array
    updatingSubFolderId: number | null = null;  // Track which subfolder is being updated
    errorMessage: string | null = null; // To display error messages to the user.



    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private folderService: FolderService,
        private subFolderService: SubFolderService,
        private fb: FormBuilder,
    ) {
        this.folderForm = this.fb.group({
            name: ['', Validators.required],
        });
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            console.log('Route parameters:', params.get('folderMetadataId'));
            this.folderName = params.get('folderName');
            this.folderMetadataId = Number(params.get('folderMetadataId'));

            this.route.queryParams.subscribe(queryParams => {
                this.categoryName = queryParams['categoryName'];
                this.subFolderName = queryParams['subFolderName'] || null;
                this.updateBreadcrumbs(this.subFolderName);  // Update breadcrumbs when categoryName is available
            });
            this.loadSubFolders();
        });
    }

    loadSubFolders(): void {
        if (this.folderMetadataId) {
            this.subFolderService.getSubFoldersByFolderMetadataId(this.folderMetadataId)
                .subscribe({
                    next: (subFolders: SubFolder[]) => {
                        this.subFolders = subFolders;
                        this.isLoaded = true;
                    },
                    error: (error: any) => {
                        console.error("Error fetching subfolders:", error);
                        this.isLoaded = true;
                    }
                });
        } else {
            this.isLoaded = true;
        }
    }

    onFileSelected(event: any): void {
        this.selectedFiles = event.target.files;

        if (this.selectedFiles) {
            this.uploadFiles();  // Call uploadFiles directly after selecting files
        }
    }

    uploadFiles(): void {
        if (!this.selectedFiles || this.selectedFiles.length === 0) {
            console.warn('No files selected.');
            return;
        }

        for (let i = 0; i < this.selectedFiles.length; i++) {
            const file = this.selectedFiles[i];
            if (file) {
                this.fileList.push({
                    name: file.name,
                    size: file.size,
                    type: file.type
                });
            }
        }

        this.selectedFiles = null; // Clear the selected files after processing
    }

    onCreateFolder(): void {
        this.showForm = true;  // Show the popup
    }

    onCancel(): void {
        this.showForm = false;  // Hide the popup
        this.folderForm.reset();
    }

    onSubmit(): void {
        if (this.folderForm.valid) {
            const newSubFolderRequest = {
                folderName: this.folderForm.value.name,
                folderPath: "dummyValue"  // Assign a dummy path
            };

            console.log('folderMetadataId before createSubFolder:', this.folderMetadataId);

            this.subFolderService.createSubFolder(newSubFolderRequest, Number(this.folderMetadataId))
                .subscribe({
                    next: (createdSubFolder: any) => {
                        console.log('Subfolder created successfully:', createdSubFolder);
                        this.loadSubFolders();
                        this.onCancel();
                        this.updateBreadcrumbs(createdSubFolder.folderName);
                    },
                    error: (error: any) => {
                        console.error('Error creating subfolder:', error);
                    }
                });
        }
    }

    onFolderClick(subFolder: SubFolder): void {
        this.router.navigate([
            'sub-folder', // Updated route path
            this.folderName,
            this.folderMetadataId,
            this.categoryName,
            subFolder.folderName
        ]);
    }

    deleteFolder(subFolder: SubFolder): void {
        if (confirm(`Are you sure you want to delete the subfolder "${subFolder.folderName}"?`)) {
            if (subFolder.id) { // Make sure the ID exists
                this.subFolderService.deleteSubFolder(subFolder.id).subscribe({
                    next: () => {
                        console.log('Subfolder deleted successfully.');
                        this.subFolders = this.subFolders.filter(sf => sf.id !== subFolder.id); // Optimistically update the UI
                    },
                    error: (error) => {
                        console.error('Error deleting subfolder:', error);
                        this.handleError(error, 'deleting');  // Call the error handling method
                    }
                });
            } else {
                console.error('Subfolder ID is missing.'); // Handle the case where the ID is missing
            }
        }
    }

    startUpdate(subFolder: SubFolder): void {
        this.updatingSubFolderId = subFolder.id || null; // Set the ID of the subfolder being updated
        this.folderForm.patchValue({ name: subFolder.folderName }); // Pre-populate the form

        this.showForm = true; // Show the popup form
    }

    cancelUpdate(): void {
        this.updatingSubFolderId = null; // Clear the ID
        this.showForm = false;
        this.folderForm.reset();
    }

    performUpdate(): void {
        if (this.updatingSubFolderId && this.folderForm.valid) {
            const updatedSubFolderData = {
                folderName: this.folderForm.value.name,
                folderPath: "dummyPath" // Or generate a path as needed
            };

            this.subFolderService.updateSubFolder(this.updatingSubFolderId, updatedSubFolderData)
                .subscribe({
                    next: (response) => {
                        console.log('Subfolder updated successfully:', response);
                        this.loadSubFolders(); // Reload subfolders to reflect the update
                        this.cancelUpdate(); // Clear update state and close the form
                    },
                    error: (error) => {
                        console.error('Error updating subfolder:', error);
                        this.handleError(error, 'updating');  // Call the error handling method
                    }
                });
        }
    }

    private updateBreadcrumbs(subFolderName: string | null = null): void {
        this.breadcrumbs = [];

        // Home
        this.breadcrumbs.push({ label: 'Accueil', url: '/' });

        // Category
        if (this.categoryName) {
            this.breadcrumbs.push({ label: this.categoryName });
        }

        // Top-Level Folder
        if (this.folderName) {
            this.breadcrumbs.push({ label: this.folderName });
        }

        // Subfolder (if present)
        if (subFolderName) {
            this.breadcrumbs.push({ label: subFolderName });
        }
    }

    private handleError(error: any, operation: string): void {
        console.error(`Error ${operation} subfolder:`, error);

        let message = 'An unexpected error occurred.'; // Default message

        if (error instanceof HttpErrorResponse) {
            if (error.status === 404) {
                message = 'Subfolder not found.';
            } else if (error.status === 403) {
                message = 'You do not have permission to perform this action.';
            }
            else if (error.status === 500) {
                message = 'Internal Server Error, please contact the administrator.';
            }
             else {
                message = `Backend returned code ${error.status}, body was: ${error.error}`;
            }
        }

        this.errorMessage = `Error ${operation} subfolder: ${message}`;
        // Optionally, display the error message to the user (e.g., in an alert)
        alert(this.errorMessage); // Replace with your preferred way of showing errors
    }
}
