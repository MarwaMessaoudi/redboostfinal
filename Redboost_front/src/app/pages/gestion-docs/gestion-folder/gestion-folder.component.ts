import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Folder as IFolder } from '../../../models/folder.model';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../service/category.service';
import { Category } from '../../../models/category.model';
import { FolderService } from '../../service/folder.service';
import { RandomImagePipe } from '../../../random-image.pipe';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface FoldersByCategory {
  category: Category;
  folders: IFolder[];
}

@Component({
    selector: 'app-gestion-folder',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, RandomImagePipe, FormsModule, HttpClientModule, RouterModule],
    templateUrl: './gestion-folder.component.html',
    styleUrls: ['./gestion-folder.component.scss'],
    providers: [CategoryService, FolderService]
})
export class GestionFolderComponent implements OnInit {
    folders: IFolder[] = [];
    showForm = false;
    folderForm: FormGroup;
    categories: Category[] = [];
    searchTerm: string = '';
    filteredFolders: IFolder[] = [];
    showCategoryForm = false;
    categoryForm: FormGroup;
    isCategoryCreating = false;
    categoryCreationError: string | null = null;
    categoryCreationSuccess: boolean = false;

    // Edit Folder Properties
    showEditForm = false;
    editFolderForm: FormGroup;
    selectedFolder: IFolder | null = null;
    isFolderUpdating = false;
    folderUpdateError: string | null = null;
    isFolderDeleting = false;
    folderDeleteError: string | null = null;

    foldersByCategory: FoldersByCategory[] = [];

    constructor(private fb: FormBuilder, private router: Router, private categoryService: CategoryService, private folderService: FolderService, private http: HttpClient) {
        this.folderForm = this.fb.group({
            name: ['', Validators.required],
            category: [null, Validators.required],
        });

        this.categoryForm = this.fb.group({
            categoryName: ['', Validators.required],
            description: ['']
        });

        this.editFolderForm = this.fb.group({
            name: ['', Validators.required],
            category: [null, Validators.required]
        });
    }

    ngOnInit(): void {
        forkJoin([this.loadCategories(), this.loadFolders()]).subscribe({
            next: () => {
                this.updateFoldersByCategory(); //Organize folders by category on init
                console.log('Categories and folders loaded successfully.');
            },
            error: (error) => {
                console.error('Error loading categories or folders:', error);
            }
        });
    }

    loadCategories(): Observable<Category[]> {
        return this.categoryService.getAllCategories().pipe(
            map((categories: Category[]) => {
                const filteredCategories = categories.filter(cat => cat.id != null);
                console.log('Loaded categories:', filteredCategories);
                this.categories = filteredCategories;
                console.log('Categories after load:', this.categories);
                return filteredCategories;
            })
        );
    }

    loadFolders(): Observable<IFolder[]> {
        return this.folderService.getAllFolders().pipe(
            map((folders) => {
                const mappedFolders = folders.map(folder => ({
                    ...folder,
                    id: String(folder.id)
                }));
                this.folders = mappedFolders;
                return mappedFolders;
            })
        );
    }

    onCreateFolder(): void {
        this.showForm = true;
    }

    onCreateCategory(): void {
        this.showCategoryForm = true;
    }

    onSearch(): void {
        if (this.searchTerm) {
            this.filteredFolders = this.folders.filter(folder =>
                folder.folderName.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
            this.updateFoldersByCategory(this.filteredFolders);
        } else {
            this.filteredFolders = [...this.folders];
            this.updateFoldersByCategory();
        }
    }

  // Update foldersByCategory data structure
  private updateFoldersByCategory(foldersToUse: IFolder[] | null = null): void {
    const folders = foldersToUse || this.folders;
    this.foldersByCategory = this.categories.map(category => ({
      category: category,
      folders: folders.filter(folder => folder.categoryId === category.id)
    })).filter(group => group.folders.length > 0);  // Only include categories with folders
  }

    onSubmit(): void {
        if (this.folderForm.valid) {
            const newFolder: IFolder = {
                id: '', // Backend will generate this
                folderName: this.folderForm.value.name,
                categoryId: this.folderForm.value.category,
                folderPath: ''
            };

            this.folderService.createFolder(newFolder).subscribe({
                next: (response: IFolder) => { // Assuming your API returns the *newly created folder*
                    console.log('Folder created successfully:', response);
                    // *IMPORTANT*:  Assign the ID from the response!
                    newFolder.id = response.id;  // Or however the ID is returned
                    this.folders = [...this.folders, newFolder]; // Add to the *existing* array using spread syntax
                    this.updateFoldersByCategory(); // Update foldersByCategory after adding a new folder
                    this.folderForm.reset();
                    this.showForm = false;
                },
                error: (error) => {
                    console.error('Error creating folder:', error);
                }
            });
        }
    }

    onCancel(): void {
        this.showForm = false;
        this.folderForm.reset();
        this.showCategoryForm = false;
        this.categoryForm.reset();
        this.categoryCreationError = null;
        this.showEditForm = false;
    }

    deleteThisFolder(folderId: string | undefined, event: Event): void {
        event.stopPropagation();
        if (this.isFolderDeleting) {
            return;
        }
        if (folderId && confirm('Are you sure you want to delete this folder?')) {
            this.isFolderDeleting = true;
            this.folderDeleteError = null;

            this.folderService.deleteFolder(folderId).subscribe({
                next: () => {
                    console.log(`Folder with ID ${folderId} deleted successfully.`);
                    this.isFolderDeleting = false;
                    this.folders = this.folders.filter(folder => folder.id !== folderId); // Remove deleted folder
                    this.updateFoldersByCategory(); // Update foldersByCategory after deleting a folder
                },
                error: (error) => {
                    console.error('Error deleting folder:', error);
                    this.isFolderDeleting = false;
                    this.folderDeleteError = 'Failed to delete folder. Please try again.';
                }
            });
        }
    }

    onFolderClick(folder: IFolder): void {
        console.log('Categories when folder clicked:', this.categories);

        if (!folder.categoryId) {
            console.warn('Folder has no categoryId:', folder);
            this.router.navigate(['gestion-folder/folder-details/user-library', folder.folderName, folder.id], {
                queryParams: { categoryName: 'Unknown Category' }
            });
            return;
        }

        const categoryIdNumber = Number(folder.categoryId);

        if (isNaN(categoryIdNumber)) {
            console.warn('Invalid categoryId (not a number):', folder.categoryId);
            this.router.navigate(['gestion-folder/folder-details/user-library', folder.folderName, folder.id], {
                queryParams: { categoryName: 'Unknown Category' }
            });
            return;
        }

        const category = this.categories.find(cat => cat.id === categoryIdNumber);

        if (!category) {
            console.warn('Category not found for folder:', folder);
            this.router.navigate(['gestion-folder/folder-details/user-library', folder.folderName, folder.id], {
                queryParams: { categoryName: 'Unknown Category' }
            });
            return;
        }

        const categoryName = category.categoryName;
        console.log('Navigating with categoryName:', categoryName);
        this.router.navigate(['gestion-folder/folder-details/user-library', folder.folderName, folder.id], {
            queryParams: { categoryName: categoryName }
        });
    }

    onCategorySubmit(): void {
        if (this.categoryForm.valid) {
            this.isCategoryCreating = true;
            this.categoryCreationError = null;
            this.categoryCreationSuccess = false;

            const newCategory: Category = {
                categoryName: this.categoryForm.value.categoryName,
                description: this.categoryForm.value.description,
            };

            this.categoryService.createCategory(newCategory).subscribe(
                (response: Category) => {
                    console.log('Category created successfully:', response);
                    newCategory.id = response.id;
                    this.categories = [...this.categories, newCategory];
                    this.updateFoldersByCategory(); // Update after a new category
                    this.categoryForm.reset();
                    this.showCategoryForm = false;
                    this.isCategoryCreating = false;
                    this.categoryCreationSuccess = true;
                },
                (error) => {
                    this.isCategoryCreating = false;
                    this.categoryCreationError = error.message;
                    console.error('Error creating category:', error);
                }
            );
        }
    }

    editFolder(folderId: string | undefined, event: Event): void {
        event.stopPropagation();
        console.log(`Editing folder with ID: ${folderId}`);

        const folderToEdit = this.folders.find(folder => folder.id === folderId);

        if (folderToEdit) {
            this.selectedFolder = folderToEdit;
            this.editFolderForm.patchValue({
                name: folderToEdit.folderName,
                category: folderToEdit.categoryId
            });
            this.showEditForm = true;
        }
    }



    onEditSubmit(): void {
        if (this.editFolderForm.valid && this.selectedFolder) {
            this.isFolderUpdating = true;
            this.folderUpdateError = null;

            const updatedFolder: IFolder = {
                id: this.selectedFolder.id,
                folderName: this.editFolderForm.value.name,
                categoryId: this.editFolderForm.value.category,
                folderPath: this.selectedFolder.folderPath
            };

            this.folderService.updateFolder(updatedFolder).subscribe({
                next: (response: IFolder) => {
                    console.log('Folder updated successfully:', response);
                    this.isFolderUpdating = false;
                    this.showEditForm = false;
                    this.selectedFolder = null;
                    this.editFolderForm.reset();
                    this.folders = this.folders.map(folder => folder.id === updatedFolder.id ? updatedFolder : folder);
                    this.updateFoldersByCategory(); // Update after updating a folder
                },
                error: (error) => {
                    console.error('Error updating folder:', error);
                    this.isFolderUpdating = false;
                    this.folderUpdateError = error.message;
                }
            });
        }
    }

    onEditCancel(): void {
        this.showEditForm = false;
        this.selectedFolder = null;
        this.editFolderForm.reset();
    }

    getColorClass(folder: IFolder): string {
        const index = this.folders.indexOf(folder) % 6;
        const colors = [
            'dark-teal',
            'medium-teal',
            'light-teal',
            'red',
            'pinkish-red',
            'light-pink'
        ];
        return colors[index];
    }

    trackByFolderId(index: number, folder: IFolder): string | undefined {
      return folder.id;
    }

    trackByCategoryId(index: number, categoryGroup: FoldersByCategory): number | undefined {
      return categoryGroup.category.id;
    }
}