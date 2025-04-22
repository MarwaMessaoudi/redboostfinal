import { Component, OnInit } from '@angular/core';
import { StaffService } from '../../service/staff.service';
import { StaffType } from '../../../../models/Staff-type';
import { Attribute } from '../../../../models/Attribute';
import { Staff } from '../../../../models/Staff';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
    selector: 'app-staff-filter',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, TableModule, ToastModule, MultiSelectModule],
    templateUrl: './staff-filter.component.html',
    styleUrls: ['./staff-filter.component.scss'],
    providers: [MessageService]
})
export class StaffFilterComponent implements OnInit {
    staffTypes: StaffType[] = [];
    attributes: Attribute[] = [];
    selectedTypeIds: number[] = [];
    selectedAttributeIds: number[] = [];
    staffList: Staff[] = [];
    filteredAttributes: Attribute[] = [];
    loading: boolean = false;

    constructor(
        private staffService: StaffService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadStaffTypes();
        this.loadAttributes();
    }

    loadStaffTypes(): void {
        this.staffService.getAllStaffTypes().subscribe({
            next: (staffTypes) => {
                this.staffTypes = staffTypes;
            },
            error: (error) => {
                console.error('Error loading staff types:', error);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load staff types' });
            }
        });
    }

    loadAttributes(): void {
        this.staffService.getAllAttributes().subscribe({
            next: (attributes) => {
                this.attributes = attributes;
            },
            error: (error) => {
                console.error('Error loading attributes:', error);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load attributes' });
            }
        });
    }

    filterStaff(): void {
        this.loading = true;
        console.log('Filtering staff with type IDs:', this.selectedTypeIds);
        this.staffService.filterStaff(this.selectedTypeIds).subscribe({
            next: (staffList) => {
                console.log('Staff data received:', staffList);
                this.staffList = staffList;
                this.filteredAttributes = this.attributes.filter((attr) => this.selectedAttributeIds.includes(attr.id));
                this.loading = false;
            },
            error: (error) => {
                console.error('Error fetching staff data:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load staff data: ' + (error.message || 'Unknown error')
                });
                this.loading = false;
            }
        });
    }

    getAttributeValue(staff: Staff, attributeId: number): string {
        const staffValue = staff.staffValues.find((sv) => sv.attribute.id === attributeId);
        return staffValue ? staffValue.value : '';
    }
}
