import { Component, OnInit } from '@angular/core';
import { StaffService } from '../../service/staff.service';
import { StaffType } from '../../../../models/Staff-type';
import { Attribute } from '../../../../models/Attribute';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-staff-type-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, TableModule, ToastModule, DialogModule, ConfirmDialogModule, MultiSelectModule, InputTextModule, RouterModule],
    templateUrl: './staff-type-list.component.html',
    styleUrls: ['./staff-type-list.component.scss'],
    providers: [MessageService, ConfirmationService]
})
export class StaffTypeListComponent implements OnInit {
    staffTypes: StaffType[] = [];
    newTypeName: string = '';
    newTypeDialogVisible: boolean = false;
    editTypeDialogVisible: boolean = false;
    availableAttributes: Attribute[] = [];
    selectedAttributeIds: number[] = [];
    defaultAttributes: Attribute[] = [];
    newAttributeName: string = '';
    newAttributeDefaultValues: string[] = [];
    loading: boolean = false;
    editStaffType: StaffType | null = null;

    constructor(
        private staffService: StaffService,
        private router: Router,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.loadStaffTypes();
        this.loadAttributes();
    }

    loadStaffTypes(): void {
        this.loading = true;
        this.staffService.getAllStaffTypes().subscribe({
            next: (staffTypes) => {
                this.staffTypes = staffTypes;
                this.loading = false;
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load staff types' });
                this.loading = false;
            }
        });
    }

    loadAttributes(): void {
        this.staffService.getAllAttributes().subscribe({
            next: (attributes) => {
                this.defaultAttributes = attributes.filter((attr) => ['firstName', 'lastName', 'email', 'phoneNumber'].includes(attr.attributeName));
                this.availableAttributes = attributes.filter((attr) => !this.defaultAttributes.some((def) => def.id === attr.id));
                if (this.defaultAttributes.length < 4) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Warning',
                        detail: 'Some default attributes are missing from the database.'
                    });
                }
            },
            error: (error) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load attributes' });
            }
        });
    }

    createStaffType(): void {
        if (!this.newTypeName) return;
        this.loading = true;
        const additionalAttributeIds = this.selectedAttributeIds.filter((id) => !this.defaultAttributes.some((attr) => attr.id === id));
        this.staffService.createStaffType(this.newTypeName, additionalAttributeIds).subscribe({
            next: (staffType) => {
                this.staffTypes.push(staffType);
                this.newTypeName = '';
                this.selectedAttributeIds = [];
                this.newTypeDialogVisible = false;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Staff type created' });
                this.loadStaffTypes();
            },
            error: (error) => {
                if (error.status === 400 && error.error?.includes('already exists')) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Warning',
                        detail: error.error || 'One or more selected attributes already exist in this StaffType'
                    });
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create staff type: ' + (error.message || 'Unknown error') });
                }
                this.loading = false;
            }
        });
    }

    createNewAttribute(): void {
        if (!this.newAttributeName) return;
        this.staffService.createAttribute(this.newAttributeName, 'STRING', this.newAttributeDefaultValues.length > 0 ? this.newAttributeDefaultValues : undefined).subscribe({
            next: (attribute: Attribute) => {
                this.loadAttributes();
                this.newAttributeName = '';
                this.newAttributeDefaultValues = [];
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Attribute created' });
            },
            error: (error: any) => {
                if (error.status === 400 && error.error?.includes('already exists')) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Warning',
                        detail: error.error || 'This attribute name already exists in the system'
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Failed to create attribute'
                    });
                }
            }
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

    deleteStaffType(id: number): void {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this staff type?',
            accept: () => {
                this.staffService.deleteStaffType(id).subscribe({
                    next: () => {
                        this.loadStaffTypes();
                        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Staff type deleted' });
                    },
                    error: (error) => {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete staff type' });
                    }
                });
            }
        });
    }

    openNewTypeDialog(): void {
        this.newTypeDialogVisible = true;
        this.newTypeName = '';
        this.selectedAttributeIds = [];
        this.newAttributeName = '';
        this.newAttributeDefaultValues = [];
    }

    openEditTypeDialog(staffType: StaffType): void {
        this.editStaffType = { ...staffType };
        this.selectedAttributeIds = staffType.attributes.map((attr) => attr.id);
        this.editTypeDialogVisible = true;
    }

    updateStaffType(): void {
        if (!this.editStaffType || !this.editStaffType.typeName) return;
        this.staffService.updateStaffType(this.editStaffType.id, this.editStaffType.typeName, this.selectedAttributeIds).subscribe({
            next: () => {
                this.loadStaffTypes();
                this.editTypeDialogVisible = false;
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Staff type updated' });
            },
            error: (error: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update staff type' })
        });
    }

    viewDetails(id: number): void {
        this.router.navigate(['/staff-types', id]);
    }
}
