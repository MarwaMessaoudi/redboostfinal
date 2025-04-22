import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../../models/user';
import { ProgramService } from '../../service/program.service';
import { UserService } from '../../../frontoffice/service/UserService';
import { Program } from '../../../../models/program.modal';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-program-monitoring',
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './program-monitoring.component.html',
    styleUrls: ['./program-monitoring.component.scss']
})
export class ProgramMonitoringComponent implements OnInit {
    programs: Program[] = [];
    filteredPrograms: Program[] = [];
    users: User[] = [];
    programForm: FormGroup;
    editProgramForm: FormGroup;
    showAddProgramForm: boolean = false;
    showEditProgramForm: boolean = false;
    showRequiredAlert: boolean = false;
    loading: boolean = true;
    selectedFile: File | null = null;
    selectedEditFile: File | null = null;
    minEndDate: string = '';
    editProgramId: number | null = null;

    constructor(
        private programService: ProgramService,
        private userService: UserService,
        private fb: FormBuilder,
        private router: Router
    ) {
        this.programForm = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
            budget: ['', [Validators.required, Validators.min(0)]],
            programLeadId: ['', Validators.required],
            logo: [null, Validators.required]
        });

        this.editProgramForm = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            startDate: ['', Validators.required],
            endDate: ['', Validators.required],
            budget: ['', [Validators.required, Validators.min(0)]],
            status: ['', Validators.required],
            programLeadId: ['', Validators.required],
            logoUrl: [''],
            logo: [null]
        });
    }

    ngOnInit(): void {
        this.loadPrograms();
        this.loadUsers();

        this.programForm.get('startDate')?.valueChanges.subscribe((value) => {
            if (value) {
                this.minEndDate = value;
            }
        });

        this.editProgramForm.get('startDate')?.valueChanges.subscribe((value) => {
            if (value) {
                this.minEndDate = value;
            }
        });
    }

    loadPrograms(): void {
        this.loading = true;
        this.programService.getPrograms().subscribe(
            (data) => {
                this.programs = data;
                this.filteredPrograms = [...this.programs];
                this.loading = false;
            },
            (error) => {
                console.error('Error loading programs:', error);
                this.loading = false;
            }
        );
    }

    loadUsers(): void {
        this.userService.getUsers().subscribe(
            (data) => {
                this.users = data;
            },
            (error) => {
                console.error('Error loading users:', error);
            }
        );
    }

    searchPrograms(event: any): void {
        const searchTerm = event.target.value.toLowerCase();
        if (!searchTerm) {
            this.filteredPrograms = [...this.programs];
            return;
        }

        this.filteredPrograms = this.programs.filter((program) => program.name.toLowerCase().includes(searchTerm) || program.description.toLowerCase().includes(searchTerm));
    }

    filterByStatus(event: any): void {
        const status = event.target.value;
        if (status === 'all') {
            this.filteredPrograms = [...this.programs];
            return;
        }

        this.filteredPrograms = this.programs.filter((program) => program.status === status);
    }

    filterByDate(event: any): void {
        const dateFilter = event.target.value;
        const today = new Date();

        if (dateFilter === 'all') {
            this.filteredPrograms = [...this.programs];
            return;
        }

        switch (dateFilter) {
            case 'upcoming':
                this.filteredPrograms = this.programs.filter((program) => {
                    const startDate = new Date(program.startDate);
                    const diff = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return diff >= 0 && diff <= 30;
                });
                break;
            case 'recent':
                this.filteredPrograms = this.programs.filter((program) => {
                    const startDate = new Date(program.startDate);
                    const diff = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                    return diff >= 0 && diff <= 30;
                });
                break;
            case 'distant':
                this.filteredPrograms = this.programs.filter((program) => {
                    const startDate = new Date(program.startDate);
                    const diff = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return diff > 30;
                });
                break;
        }
    }

    openAddProgramForm(): void {
        this.showAddProgramForm = true;
        this.resetForm();
    }

    closeAddProgramForm(): void {
        this.showAddProgramForm = false;
        this.showRequiredAlert = false;
        this.resetForm();
    }

    openEditProgramForm(program: Program): void {
        this.editProgramId = program.id;
        this.showEditProgramForm = true;
        this.editProgramForm.patchValue({
            name: program.name,
            description: program.description,
            startDate: program.startDate,
            endDate: program.endDate,
            budget: program.budget,
            status: program.status,
            programLeadId: program.programLead?.id || '',
            logoUrl: program.logoUrl
        });
        this.selectedEditFile = null;
    }

    closeEditProgramForm(): void {
        this.showEditProgramForm = false;
        this.showRequiredAlert = false;
        this.editProgramForm.reset();
        this.selectedEditFile = null;
        this.editProgramId = null;
    }

    resetForm(): void {
        this.programForm.reset();
        this.selectedFile = null;
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            this.programForm.patchValue({ logo: file.name });
            this.programForm.get('logo')?.markAsDirty();
        }
    }

    onEditFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedEditFile = file;
            this.editProgramForm.patchValue({ logo: file.name });
            this.editProgramForm.get('logo')?.markAsDirty();
        }
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.programForm.get(fieldName);
        return field ? field.invalid && (field.dirty || field.touched) : false;
    }

    isEditFieldInvalid(fieldName: string): boolean {
        const field = this.editProgramForm.get(fieldName);
        return field ? field.invalid && (field.dirty || field.touched) : false;
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'ACTIVE':
                return 'Actif';
            case 'ENATTENTE':
                return 'En attente';
            case 'TERMINE':
                return 'Terminé';
            default:
                return status;
        }
    }

    addProgram(): void {
        if (this.programForm.invalid) {
            this.showRequiredAlert = true;
            Object.keys(this.programForm.controls).forEach((key) => {
                this.programForm.get(key)?.markAsTouched();
            });
            return;
        }

        this.showRequiredAlert = false;
        const formData = new FormData();

        Object.keys(this.programForm.value).forEach((key) => {
            if (key !== 'logo') {
                formData.append(key, this.programForm.value[key]);
            }
        });

        if (this.selectedFile) {
            formData.append('logo', this.selectedFile, this.selectedFile.name);
        }

        this.programService.addProgram(formData).subscribe(
            () => {
                this.closeAddProgramForm();
                this.loadPrograms();
            },
            (error) => {
                console.error('Error adding program:', error);
            }
        );
    }

    updateProgram(): void {
        if (this.editProgramForm.invalid) {
            this.showRequiredAlert = true;
            Object.keys(this.editProgramForm.controls).forEach((key) => {
                this.editProgramForm.get(key)?.markAsTouched();
            });
            return;
        }

        this.showRequiredAlert = false;
        const formData = new FormData();

        Object.keys(this.editProgramForm.value).forEach((key) => {
            if (key !== 'logo' && key !== 'logoUrl') {
                formData.append(key, this.editProgramForm.value[key]);
            }
        });

        if (this.selectedEditFile) {
            formData.append('logo', this.selectedEditFile, this.selectedEditFile.name);
        }

        if (this.editProgramId !== null) {
            this.programService.updateProgram(this.editProgramId, formData).subscribe(
                () => {
                    this.closeEditProgramForm();
                    this.loadPrograms();
                },
                (error) => {
                    console.error('Error updating program:', error);
                }
            );
        }
    }

    deleteProgram(programId: number): void {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) {
            this.programService.deleteProgram(programId).subscribe(
                () => {
                    this.loadPrograms();
                },
                (error) => {
                    console.error('Error deleting program:', error);
                }
            );
        }
    }

    viewProgram(programId: number) {
        this.router.navigate(['/programs', programId]);
    }
}
