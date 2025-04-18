// program-management.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../models/user';
import { ProgramService } from '../../service/program.service';
import { UserService } from '../../service/UserService';
import { Program } from '../../../models/program.modal';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-program-monitoring',
  imports:[CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './program-monitoring.component.html',
  styleUrls: ['./program-monitoring.component.scss']
})
export class ProgramMonitoringComponent implements OnInit {
  programs: Program[] = [];
  filteredPrograms: Program[] = [];
  users: User[] = [];
  programForm: FormGroup;
  showAddProgramForm: boolean = false;
  showRequiredAlert: boolean = false;
  loading: boolean = true;
  selectedFile: File | null = null;
  minEndDate: string = '';
  selectedEditLogo: File | null = null;
  editProgramId: number | null = null;
  showEditProgramForm = false;
  editProgramForm: FormGroup;
  
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
      logo: [null, Validators.required],
    });
    this.editProgramForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      budget: ['', Validators.required],
      status: ['', Validators.required],
      programLeadId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadPrograms();
    this.loadUsers();
    
    // Watch for changes to startDate to set minimum end date
    this.programForm.get('startDate')?.valueChanges.subscribe(value => {
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
      programLeadId: program.programLead?.id || ''
    });
  }


  searchPrograms(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    if (!searchTerm) {
      this.filteredPrograms = [...this.programs];
      return;
    }

    this.filteredPrograms = this.programs.filter(program => 
      program.name.toLowerCase().includes(searchTerm) || 
      program.description.toLowerCase().includes(searchTerm)
    );
  }

  filterByStatus(event: any): void {
    const status = event.target.value;
    if (status === 'all') {
      this.filteredPrograms = [...this.programs];
      return;
    }

    this.filteredPrograms = this.programs.filter(program => program.status === status);
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
        // Programs starting in the next 30 days
        this.filteredPrograms = this.programs.filter(program => {
          const startDate = new Date(program.startDate);
          const diff = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return diff >= 0 && diff <= 30;
        });
        break;
      case 'recent':
        // Programs that started in the last 30 days
        this.filteredPrograms = this.programs.filter(program => {
          const startDate = new Date(program.startDate);
          const diff = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          return diff >= 0 && diff <= 30;
        });
        break;
      case 'distant':
        // Programs starting more than 30 days in the future
        this.filteredPrograms = this.programs.filter(program => {
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.programForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'pending':
        return 'En attente';
      case 'completed':
        return 'Terminé';
      default:
        return status;
    }
  }

  addProgram(): void {
    if (this.programForm.invalid) {
      this.showRequiredAlert = true;
      // Mark all fields as touched to show validation errors
      Object.keys(this.programForm.controls).forEach(key => {
        this.programForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.showRequiredAlert = false;
    const formData = new FormData();
    
    // Add form values to FormData
    Object.keys(this.programForm.value).forEach(key => {
      if (key !== 'logo') {
        formData.append(key, this.programForm.value[key]);
      }
    });

    // Add file if selected
    if (this.selectedFile) {
      formData.append('logo', this.selectedFile, this.selectedFile.name);
    }

    this.programService.addProgram(formData).subscribe(
      (response) => {
        this.closeAddProgramForm();
        this.loadPrograms(); // Reload programs after adding
      },
      (error) => {
        console.error('Error adding program:', error);
      }
    );
  }

  editProgram(programId: number): void {
    // Navigate to edit page or open edit modal
    console.log('Edit program with ID:', programId);
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
editFormGroup!: FormGroup;

startEditing(program: Program): void {
  this.editProgramId = program.id;

  this.editFormGroup = this.fb.group({
    name: [program.name, Validators.required],
    description: [program.description, Validators.required],
    startDate: [program.startDate, Validators.required],
    endDate: [program.endDate, Validators.required],
    budget: [program.budget, Validators.required],
    status: [program.status, Validators.required]
  });
}

updateProgram(id: number): void {
  if (this.editFormGroup.invalid) return;

  const updated = this.editFormGroup.value;
  this.programService.updateProgram(id, updated).subscribe(
    () => {
      this.editProgramId = null;
      this.loadPrograms(); // Refresh list
    },
    error => console.error('Update failed:', error)
  );
}

}