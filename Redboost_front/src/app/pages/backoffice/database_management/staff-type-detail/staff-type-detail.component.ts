import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StaffService } from '../../service/staff.service';
import { StaffType } from '../../../../models/Staff-type';
import { Attribute } from '../../../../models/Attribute';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-staff-type-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, TableModule, ToastModule, DialogModule, MultiSelectModule, InputTextModule],
    templateUrl: './staff-type-detail.component.html',
    styleUrls: ['./staff-type-detail.component.scss'],
    providers: [MessageService]
})
export class StaffTypeDetailComponent implements OnInit {
    typeId: number = 0;
    staffType: StaffType | undefined;
    selectedFile: File | null = null;
    addAttributeDialogVisible: boolean = false;
    editAttributeDialogVisible: boolean = false;
    availableAttributes: Attribute[] = [];
    selectedAttributeIds: number[] = [];
    newAttributeName: string = '';
    newAttributeDefaultValues: string[] = [];
    editAttribute: Attribute | null = null;
    defaultAttributeNames: string[] = ['firstName', 'lastName', 'email', 'phoneNumber'];

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    constructor(
        private route: ActivatedRoute,
        private staffService: StaffService,
        private messageService: MessageService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.typeId = +params['id'];
            console.log('Loading staff type for ID:', this.typeId);
            this.loadStaffType();
            this.loadAvailableAttributes();
        });
    }

    get filteredAttributes(): Attribute[] {
        return (this.staffType?.attributes || []).filter((attr) => attr != null);
    }

    isDefaultAttribute(attribute: Attribute): boolean {
        return this.defaultAttributeNames.includes(attribute.attributeName);
    }

    loadStaffType(): void {
        this.staffService.getStaffTypeById(this.typeId).subscribe({
            next: (staffType: StaffType) => {
                console.log('Staff type loaded:', staffType);
                this.staffType = staffType;
            },
            error: (error: any) => {
                console.error('Error loading staff type:', error);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load staff type' });
            }
        });
    }

    loadAvailableAttributes(): void {
        this.staffService.getAvailableAttributesForType(this.typeId).subscribe({
            next: (attributes: Attribute[]) => {
                console.log('Available attributes loaded:', attributes);
                this.availableAttributes = attributes;
            },
            error: (error: any) => {
                console.error('Error loading available attributes:', error);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load available attributes' });
            }
        });
    }

    downloadTemplate(): void {
        this.staffService.downloadTemplate(this.typeId).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${this.staffType?.typeName}_template.xlsx`;
                a.click();
                window.URL.revokeObjectURL(url);
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Template downloaded' });
            },
            error: (error: any) => {
                console.error('Download error:', error);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to download template' });
            }
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            if (file && file.name.endsWith('.xlsx')) {
                this.selectedFile = file;
                console.log('Selected file:', file.name, file.size, file.lastModified);
            } else {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select an .xlsx file' });
            }
        }
    }

    uploadFile(): void {
        if (!this.selectedFile) {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No file selected' });
            return;
        }

        console.log('Uploading file:', this.selectedFile.name, this.selectedFile.size);
        this.staffService.importStaff(this.typeId, this.selectedFile).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'File uploaded successfully' });
                this.selectedFile = null;
                if (this.fileInput) {
                    this.fileInput.nativeElement.value = '';
                }
                this.loadStaffType();
            },
            error: (error: any) => {
                console.error('Upload error:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Failed to upload file'
                });
            }
        });
    }

    openAddAttributeDialog(): void {
        this.addAttributeDialogVisible = true;
        this.selectedAttributeIds = [];
        this.newAttributeName = '';
        this.newAttributeDefaultValues = [];
    }

    addAttribute(): void {
        if (this.selectedAttributeIds && this.selectedAttributeIds.length > 0) {
            const addAttributeRequests = this.selectedAttributeIds.map((attributeId: number) =>
                this.staffService
                    .createNewAttributeForType(this.typeId, attributeId)
                    .toPromise()
                    .then(() => {
                        console.log(`Attribute ID ${attributeId} added successfully`);
                    })
                    .catch((error: any) => {
                        if (error.status === 400 && error.error?.includes('already exists')) {
                            this.messageService.add({
                                severity: 'warn',
                                summary: 'Warning',
                                detail: error.error || `Attribute with ID ${attributeId} already exists in this StaffType`
                            });
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: `Failed to add attribute ID ${attributeId}: ${error.message || 'Unknown error'}`
                            });
                        }
                        throw error;
                    })
            );

            Promise.all(addAttributeRequests)
                .then(() => {
                    this.loadStaffType();
                    this.loadAvailableAttributes();
                    this.addAttributeDialogVisible = false;
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Attributes added successfully' });
                })
                .catch(() => {
                    console.error('One or more attribute additions failed');
                });
        } else if (this.newAttributeName) {
            this.staffService.createAttribute(this.newAttributeName, 'STRING', this.newAttributeDefaultValues.length > 0 ? this.newAttributeDefaultValues : undefined).subscribe({
                next: () => {
                    this.staffService.getAllAttributes().subscribe({
                        next: (attributes: Attribute[]) => {
                            const newAttr = attributes.find((attr) => attr.attributeName === this.newAttributeName);
                            if (newAttr) {
                                this.staffService.createNewAttributeForType(this.typeId, newAttr.id).subscribe({
                                    next: () => {
                                        this.loadStaffType();
                                        this.loadAvailableAttributes();
                                        this.addAttributeDialogVisible = false;
                                        this.newAttributeDefaultValues = [];
                                        this.newAttributeName = '';
                                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'New attribute added' });
                                    },
                                    error: (error: any) => {
                                        if (error.status === 400 && error.error?.includes('already exists')) {
                                            this.messageService.add({
                                                severity: 'warn',
                                                summary: 'Warning',
                                                detail: error.error || 'This attribute name already exists in this StaffType'
                                            });
                                        } else {
                                            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add attribute to staff type' });
                                        }
                                    }
                                });
                            } else {
                                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to find newly created attribute' });
                            }
                        },
                        error: (error: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch attributes' })
                    });
                },
                error: (error: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create attribute' })
            });
        } else {
            this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select at least one attribute or enter a new attribute name' });
        }
    }

    openEditAttributeDialog(attribute: Attribute): void {
        this.editAttribute = { ...attribute };
        this.editAttributeDialogVisible = true;
    }

    updateAttribute(): void {
        if (!this.editAttribute) return;
        this.staffService
            .updateAttribute(
                this.editAttribute.id,
                this.editAttribute.attributeName,
                'STRING', // Data type is always STRING
                this.editAttribute.defaultValues
            )
            .subscribe({
                next: () => {
                    this.loadStaffType();
                    this.editAttributeDialogVisible = false;
                    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Attribute updated' });
                },
                error: (error: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update attribute' })
            });
    }

    deleteAttribute(attributeId: number): void {
        this.staffService.deleteAttribute(attributeId).subscribe({
            next: () => {
                this.loadStaffType();
                this.loadAvailableAttributes();
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Attribute deleted' });
            },
            error: (error: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete attribute' })
        });
    }

    addDefaultValue(value: string): void {
        if (value && !this.newAttributeDefaultValues.includes(value)) {
            this.newAttributeDefaultValues.push(value);
        }
    }

    removeDefaultValue(value: string): void {
        this.newAttributeDefaultValues = this.newAttributeDefaultValues.filter((v) => v !== value);
    }

    addDefaultValueEdit(value: string): void {
        if (value && this.editAttribute && !this.editAttribute.defaultValues?.includes(value)) {
            this.editAttribute.defaultValues = this.editAttribute.defaultValues || [];
            this.editAttribute.defaultValues.push(value);
        }
    }

    removeDefaultValueEdit(value: string): void {
        if (this.editAttribute && this.editAttribute.defaultValues) {
            this.editAttribute.defaultValues = this.editAttribute.defaultValues.filter((v) => v !== value);
        }
    }

    goToStaffTypes(): void {
        this.router.navigate(['/staff-types']);
    }
}
