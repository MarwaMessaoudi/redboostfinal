import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Folder as IFolder } from '../../../models/folder.model';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../service/category.service';
import { Category } from '../../../models/category.model';
import { FolderService } from '../../service/folder.service';
import { RandomImagePipe } from '../../../random-image.pipe';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subscription, throwError, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface FoldersByCategory {
    category: Category;
    folders: IFolder[];
}

@Component({
    selector: 'app-gestion-folder',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, RandomImagePipe, FormsModule, RouterModule],
    templateUrl: './gestion-folder.component.html',
    styleUrls: ['./gestion-folder.component.scss'],
    providers: [CategoryService, FolderService]
})
export class GestionFolderComponent implements OnInit, OnDestroy {
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

    showEditForm = false;
    editFolderForm: FormGroup;
    selectedFolder: IFolder | null = null;
    isFolderUpdating = false;
    folderUpdateError: string | null = null;
    isFolderDeleting = false;
    folderDeleteError: string | null = null;

    foldersByCategory: FoldersByCategory[] = [];

    private subscriptions: Subscription = new Subscription();

    constructor(private fb: FormBuilder, private router: Router, private categoryService: CategoryService, private folderService: FolderService, private http: HttpClient, private cdRef: ChangeDetectorRef) { // Inject ChangeDetectorRef
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
        console.log("ngOnInit is running!");
        this.loadInitialData();
    }

    private loadInitialData(): void {
        const accessToken = this.getAccessToken();
        if (!accessToken) {
            console.warn("No access token found. Redirecting to login.");
            this.router.navigate(['/login']);
            return;
        }

        this.subscriptions.add(
            forkJoin({
                categories: this.loadCategories(),
                folders: this.loadFolders()
            }).subscribe({
                next: ({ categories, folders }) => {
                    this.categories = categories;
                    this.folders = folders;
                    console.log("Categories loaded:", categories);
                    console.log("Folders loaded:", folders);
                    this.updateFoldersByCategory();
                    this.cdRef.detectChanges();
                },
                error: (error) => {
                    console.error("Error loading data:", error);
                    this.categories = [];
                    this.folders = [];
                    this.cdRef.detectChanges();
                }
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    loadCategories(): Observable<Category[]> {
        const accessToken = this.getAccessToken();
        const headers = this.getHeaders(accessToken);

        return this.categoryService.getAllCategories(headers).pipe(
            map((categories: Category[]) => {
                const filteredCategories = categories.filter(cat => cat.id != null);
                console.log('Loaded categories:', filteredCategories);
                return filteredCategories;
            }),
            catchError(this.handleError)
        );
    }

    loadFolders(): Observable<IFolder[]> {
        const accessToken = this.getAccessToken();
        const headers = this.getHeaders(accessToken);

        return this.folderService.getAllFolders(headers).pipe(
            map((folders) => {
                return folders;
            }),
            catchError(this.handleError)
        );
    }

    onCreateFolder(): void {
        this.showForm = true;
    }

    onCreateCategory(): void {
        const accessToken = this.getAccessToken();
        if (!accessToken) {
            console.warn("No access token found. Redirecting to login.");
            this.router.navigate(['/login']);
            return;
        }
        this.showCategoryForm = true;
    }

    onSearch(): void {
        if (this.searchTerm) {
            this.filteredFolders = this.folders.filter(folder =>
                folder.folderName.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        } else {
            this.filteredFolders = [...this.folders];
        }
    }

    private updateFoldersByCategory(): void {
        console.log('Updating folders by category...');
        this.foldersByCategory = this.categories.map(category => {
            const categoryId = typeof category.id === 'number' ? category.id : Number(category.id);
            console.log('Category ID (converted):', categoryId, typeof categoryId);

            const filteredFolders = this.folders.filter(folder => {
                if (!folder.categoryId) {
                    console.warn(`Folder "${folder.folderName}" has no categoryId!`);
                    return false; // Exclude this folder
                }
                const folderCategoryId = typeof folder.categoryId === 'number' ? folder.categoryId : Number(folder.categoryId);
                console.log('Folder Category ID (converted):', folderCategoryId, typeof folderCategoryId);

                return folderCategoryId === categoryId; // Compare as Numbers after Conversion
            });
            console.log(`Category ${category.categoryName} has ${filteredFolders.length} folders`);
            return {
                category: category,
                folders: filteredFolders
            };
        });
        console.log('foldersByCategory:', this.foldersByCategory);
        this.cdRef.detectChanges();
    }

    onSubmit(): void {
        const accessToken = this.getAccessToken();
        if (!accessToken) {
            console.warn("No access token found. Redirecting to login.");
            this.router.navigate(['/login']);
            return;
        }
        if (this.folderForm.valid) {
            const newFolder: IFolder = {
                id: 0,
                folderName: this.folderForm.value.name,
                categoryId: this.folderForm.value.category,
                folderPath: ''
            };

            const headers = this.getHeaders(accessToken);

            this.subscriptions.add(
                this.folderService.createFolder(newFolder, headers).subscribe({
                    next: (response: IFolder) => {
                        console.log('Folder created successfully:', response);
                        newFolder.id = response.id;

                        this.folders = [...this.folders, newFolder];
                        this.updateFoldersByCategory();
                        this.folderForm.reset();
                        this.showForm = false;
                        this.cdRef.detectChanges();

                    },
                    error: (error) => {
                        console.error('Error creating folder:', error);
                        this.cdRef.detectChanges();
                    }
                })
            );
        }
    }

    onCancel(): void {
        this.showForm = false;
        this.folderForm.reset();
        this.showCategoryForm = false;
        this.categoryForm.reset();
        this.categoryCreationError = null;
        this.showEditForm = false;
        this.cdRef.detectChanges();
    }

    deleteThisFolder(folderId: number | undefined, event: Event): void {
        const accessToken = this.getAccessToken();
        if (!accessToken) {
            console.warn("No access token found. Redirecting to login.");
            this.router.navigate(['/login']);
            return;
        }
        event.stopPropagation();
        if (this.isFolderDeleting) {
            return;
        }

        if (folderId && confirm('Are you sure you want to delete this folder?')) {
            this.isFolderDeleting = true;
            this.folderDeleteError = null;

            const headers = this.getHeaders(accessToken);

            this.subscriptions.add(
                this.folderService.deleteFolder(folderId, headers).subscribe({
                    next: () => {
                        console.log(`Folder with ID ${folderId} deleted successfully.`);
                        this.isFolderDeleting = false;

                        this.folders = this.folders.filter(folder => folder.id !== folderId);
                        this.updateFoldersByCategory();
                        this.cdRef.detectChanges();
                    },
                    error: (error) => {
                        console.error('Error deleting folder:', error);
                        this.isFolderDeleting = false;
                        this.folderDeleteError = 'Failed to delete folder. Please try again.';
                        this.cdRef.detectChanges();
                    }
                })
            );
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

        const category = this.categories.find(cat => cat.id === folder.categoryId);

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
        const accessToken = this.getAccessToken();
        if (!accessToken) {
            console.warn("No access token found. Redirecting to login.");
            this.router.navigate(['/login']);
            return;
        }
        if (this.categoryForm.valid) {
            this.isCategoryCreating = true;
            this.categoryCreationError = null;
            this.categoryCreationSuccess = false;

            const newCategory: Category = {
                categoryName: this.categoryForm.value.categoryName,
                description: this.categoryForm.value.description,
            };

            const headers = this.getHeaders(accessToken);

            this.subscriptions.add(
                this.categoryService.createCategory(newCategory, headers).subscribe(
                    (response: Category) => {
                        console.log('Category created successfully:', response);
                        newCategory.id = response.id;
                        this.categories = [...this.categories, newCategory];
                        this.updateFoldersByCategory();
                        this.categoryForm.reset();
                        this.showCategoryForm = false;
                        this.isCategoryCreating = false;
                        this.categoryCreationSuccess = true;
                        this.cdRef.detectChanges();
                    },
                    (error) => {
                        this.isCategoryCreating = false;
                        this.categoryCreationError = error.message;
                        console.error('Error creating category:', error);
                        this.cdRef.detectChanges();
                    }
                )
            );
        }
    }

    editFolder(folderId: number | undefined, event: Event): void {
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
            this.cdRef.detectChanges();
        }
    }

    onEditSubmit(): void {
        const accessToken = this.getAccessToken();
        if (!accessToken) {
            console.warn("No access token found. Redirecting to login.");
            this.router.navigate(['/login']);
            return;
        }
        if (this.editFolderForm.valid && this.selectedFolder) {
            this.isFolderUpdating = true;
            this.folderUpdateError = null;

            const updatedFolder: IFolder = {
                id: this.selectedFolder.id,
                folderName: this.editFolderForm.value.name,
                categoryId: this.editFolderForm.value.category,
                folderPath: this.selectedFolder.folderPath
            };

            const headers = this.getHeaders(accessToken);

            this.subscriptions.add(
                this.folderService.updateFolder(updatedFolder, headers).subscribe({
                    next: (response: IFolder) => {
                        console.log('Folder updated successfully:', response);
                        this.isFolderUpdating = false;
                        this.showEditForm = false;
                        this.selectedFolder = null;
                        this.editFolderForm.reset();
                        this.folders = this.folders.map(folder => folder.id === updatedFolder.id ? updatedFolder : folder);
                        this.updateFoldersByCategory();
                        this.cdRef.detectChanges();
                    },
                    error: (error) => {
                        console.error('Error updating folder:', error);
                        this.isFolderUpdating = false;
                        this.folderUpdateError = error.message;
                        this.cdRef.detectChanges();
                    }
                })
            );
        }
    }

    onEditCancel(): void {
        this.showEditForm = false;
        this.selectedFolder = null;
        this.editFolderForm.reset();
        this.cdRef.detectChanges();
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

    trackByFolderId(index: number, folder: IFolder): number | undefined {
        return folder.id;
    }

    trackByCategoryId(index: number, categoryGroup: FoldersByCategory): number | undefined {
        return categoryGroup.category.id;
    }

    private getAccessToken(): string | null {
        return localStorage.getItem('authToken');
    }

    private getHeaders(accessToken: string | null): HttpHeaders {
        let headers = new HttpHeaders();
        if (accessToken) {
            headers = headers.set('Authorization', `Bearer ${accessToken}`);
        }
        return headers;
    }

    private handleError = (error: any): Observable<never> => {
        console.error('API Error:', error);

        // Handle the original error, allowing it to propagate
        if (error.status === 401) {
            console.error('Unauthorized request. Redirecting to login.');
            localStorage.removeItem('access_token');
            this.router.navigate(['/login']);
        }

        // Rethrow the original error for proper handling
        return throwError(() => error);
    }
}
