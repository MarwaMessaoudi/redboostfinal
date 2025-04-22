import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SignupModalComponent } from './RegistrationComponent';
import { ModifierComponent } from './ModifierComponent';
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule,
    SignupModalComponent,
    FormsModule, // Add FormsModule to imports
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.scss']
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  isSubmitting: boolean = false;
  selectedRole: string = 'TOUS'; // Default to "TOUS" (ALL)
  roles: string[] = ['TOUS', 'COACH', 'ENTREPRENEUR', 'ADMIN', 'INVESTOR', 'SUPERADMIN']; // Available roles for filtering
  private apiUrl = 'http://localhost:8085/users'; // Backend API URL

  constructor(
    private http: HttpClient, // Use HttpClient directly
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // Load users based on the selected role
  loadUsers(): void {
    const roleParam = this.selectedRole === 'TOUS' ? null : this.selectedRole;
    const url = roleParam ? `${this.apiUrl}?role=${roleParam}` : this.apiUrl;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs', error);
      }
    });
  }

  // Handle role filter change
  onRoleFilterChange(role: string): void {
    this.selectedRole = role;
    this.loadUsers();
  }

  deleteUser(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression', error);
        }
      });
    }
  }

  showEditUserDialog(user: any): void {
    const modalRef = this.modalService.open(ModifierComponent, { size: 'lg' });
    modalRef.componentInstance.user = user;
    modalRef.result.then(
      (result) => {
        if (result === 'updated') {
          this.loadUsers();
        }
      },
      (reason) => {
        console.log('Modal dismissed:', reason);
      }
    );
  }

  showCreateUserDialog(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const modalRef = this.modalService.open(SignupModalComponent, {
      centered: true,
      size: 'sm',
      backdrop: true,
      keyboard: true
    });

    modalRef.componentInstance.userCreated.subscribe((user: any) => {
      this.loadUsers();
      modalRef.close();
    });

    modalRef.componentInstance.onCancel.subscribe(() => {
      modalRef.close();
    });

    modalRef.result.finally(() => {
      this.isSubmitting = false;
    });
  }
}