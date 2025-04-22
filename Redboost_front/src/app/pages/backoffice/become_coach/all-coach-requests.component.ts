import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

interface CoachRequest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  linkedin: string;
  specialization: string;
  yearsOfExperience: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

@Component({
  selector: 'app-all-coach-requests',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  template: `
    <div class="container">
      <h2 class="title">All Coach Requests</h2>
      <div *ngIf="loading" class="loading">Loading requests...</div>
      <div *ngIf="error" class="error">{{ error }}</div>
      <table *ngIf="!loading && !error && requests.length > 0" class="requests-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Specialization</th>
            <th>Years of Exp.</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let request of requests">
            <td>{{ request.id }}</td>
            <td>{{ request.firstName }}</td>
            <td>{{ request.lastName }}</td>
            <td>{{ request.email }}</td>
            <td>{{ request.specialization }}</td>
            <td>{{ request.yearsOfExperience }}</td>
            <td>{{ request.status }}</td>
            <td>{{ request.createdAt | date:'medium' }}</td>
            <td>
              <button *ngIf="request.status === 'PENDING'" 
                      class="approve-btn" 
                      (click)="approveRequest(request.id)">
                Approve
              </button>
              <button *ngIf="request.status === 'PENDING'" 
                      class="reject-btn" 
                      (click)="rejectRequest(request.id)">
                Reject
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div *ngIf="!loading && !error && requests.length === 0" class="no-data">
        No coach requests found.
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 40px auto;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .title {
      font-size: 2rem;
      font-weight: bold;
      color: #034A55;
      margin-bottom: 20px;
      text-align: center;
    }
    .loading {
      text-align: center;
      color: #034A55;
      font-size: 1.2rem;
    }
    .error {
      text-align: center;
      color: #C8223A;
      font-size: 1.2rem;
      margin-bottom: 20px;
    }
    .requests-table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background-color: #f3f4f6;
      color: #034A55;
      font-weight: 600;
    }
    tr:hover {
      background-color: #f9fafb;
    }
    .approve-btn, .reject-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: background-color 0.3s;
    }
    .approve-btn {
      background-color: #10b981;
      color: white;
      margin-right: 8px;
    }
    .approve-btn:hover {
      background-color: #059669;
    }
    .reject-btn {
      background-color: #ef4444;
      color: white;
    }
    .reject-btn:hover {
      background-color: #dc2626;
    }
    .no-data {
      text-align: center;
      color: #6b7280;
      font-size: 1.2rem;
      margin-top: 20px;
    }
  `]
})
export class AllCoachRequestsComponent implements OnInit {
  requests: CoachRequest[] = [];
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchRequests();
  }

  fetchRequests() {
    this.loading = true;
    this.error = null;
    this.http.get<CoachRequest[]>('http://localhost:8085/api/coach/requests').subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load coach requests. Please try again later.';
        this.loading = false;
        console.error('Error fetching requests:', err);
      }
    });
  }

  approveRequest(requestId: number) {
    this.http.put(`http://localhost:8085/api/coach/approve/${requestId}`, {}, { responseType: 'text' }).subscribe({
      next: (response) => {
        alert(response); // "Coach request approved successfully"
        this.fetchRequests(); // Refresh the list
      },
      error: (err) => {
        alert('Failed to approve request: ' + (err.error || 'Unknown error'));
        console.error('Error approving request:', err);
      }
    });
  }

  rejectRequest(requestId: number) {
    this.http.put(`http://localhost:8085/api/coach/reject/${requestId}`, {}, { responseType: 'text' }).subscribe({
      next: (response) => {
        alert(response); // "Coach request rejected successfully"
        this.fetchRequests(); // Refresh the list
      },
      error: (err) => {
        alert('Failed to reject request: ' + (err.error || 'Unknown error'));
        console.error('Error rejecting request:', err);
      }
    });
  }
}