import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import axios from 'axios';

@Component({
  selector: 'app-startup-investment-requests',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold mb-4">Investment Requests for Startup</h1>

      <!-- Investment Requests Listings -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let request of investmentRequests" class="p-4 border rounded shadow-md bg-white">
          <h2 class="text-xl font-semibold">{{ request.investor.name }}</h2>
          <p class="text-sm text-gray-500">Phone: {{ request.investor.phoneNumber }}</p>
          <p class="mt-2">{{ request.message }}</p>
          <p class="mt-4 text-sm font-medium">Proposed Amount: {{ request.proposedAmount | currency }}</p>
          
          <!-- Status -->
          <p class="mt-2 text-sm font-bold">Status: 
            <span [ngClass]="getStatusClass(request.status)">{{ request.status }}</span>
          </p>

          <!-- Action Buttons -->
          <div class="mt-4 flex space-x-2">
            <button 
              class="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
              (click)="updateStatus(request.id, 'ACCEPTED')"
              [disabled]="request.status === 'ACCEPTED'">
              ✅ Accept
            </button>

            <button 
              class="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
              (click)="updateStatus(request.id, 'DECLINED')"
              [disabled]="request.status === 'DECLINED'">
              ❌ Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .container {
        max-width: 800px;
      }
      .pending {
        color: orange;
      }
      .accepted {
        color: green;
      }
      .declined {
        color: red;
      }
    `
  ]
})
export class Startup {
  investmentRequests: any[] = [];
  startupId: number = 1; // Replace with actual startup ID if needed

  constructor(private http: HttpClient) {
    this.fetchStartupInvestmentRequests();
  }

  fetchStartupInvestmentRequests() {
    axios
      .get(`http://localhost:8085/api/investment-requests/startup/${this.startupId}`)
      .then((response) => {
        this.investmentRequests = response.data;
      })
      .catch((error) => {
        console.error('Error fetching investment requests:', error);
      });
  }

  updateStatus(requestId: number, newStatus: string) {
    if (newStatus === 'ACCEPTED') {
      axios
        .delete(`http://localhost:8085/api/investment-requests/${requestId}`)
        .then(() => {
          // Remove the request from the UI
          this.investmentRequests = this.investmentRequests.filter(req => req.id !== requestId);
        })
        .catch((error) => {
          console.error(`Error deleting request ${requestId}:`, error);
        });
    } else {
      axios
        .put(`http://localhost:8085/api/investment-requests/${requestId}/status?status=${newStatus}`)
        .then(() => {
          // Update the status for declined requests
          this.investmentRequests = this.investmentRequests.map(req =>
            req.id === requestId ? { ...req, status: newStatus } : req
          );
        })
        .catch((error) => {
          console.error(`Error updating request ${requestId} to ${newStatus}:`, error);
        });
    }
  }
  
  
  

  getStatusClass(status: string): string {
    return status === 'ACCEPTED' ? 'accepted' : status === 'DECLINED' ? 'declined' : 'pending';
  }
}
