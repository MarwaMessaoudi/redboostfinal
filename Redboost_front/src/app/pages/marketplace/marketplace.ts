import { Component, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  template: `
    <div class="container mx-auto p-6 max-w-4xl">
      <h1 class="text-4xl font-bold text-center text-gray-800 mb-6">Startup Marketplace</h1>

      <div class="flex gap-4 mb-6">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          placeholder="Search startups..."
          class="border p-3 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-500"
        />
        <select
          [(ngModel)]="selectedCategory"
          class="border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All</option>
          <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
        </select>
      </div>

      <div class="space-y-6">
        <div
          *ngFor="let startup of displayedStartups"
          class="p-6 border rounded-lg shadow-md bg-white hover:shadow-lg transition duration-300"
        >
          <h2 class="text-xl font-semibold text-gray-800">{{ startup.name }}</h2>
          <p class="text-sm text-gray-500">{{ startup.category }}</p>
          <p class="mt-3 text-gray-700">{{ startup.description }}</p>
          <div class="flex gap-4 mt-4">
            <button
              (click)="openModal(startup)"
              class="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Send Proposal
            </button>
            <button
              (click)="viewStartupDetails(startup.id)"
              class="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="text-center text-gray-500 mt-4">Loading more startups...</div>

      <div
        *ngIf="isModalOpen"
        class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
      >
        <div class="bg-white p-6 rounded-lg shadow-2xl w-96">
          <h3 class="text-2xl font-semibold mb-4">Send Proposal</h3>
          <textarea
            [(ngModel)]="message"
            placeholder="Your message"
            class="w-full p-3 border rounded-lg mb-4"
            rows="4"
          ></textarea>
          <input
            [(ngModel)]="proposedAmount"
            type="number"
            placeholder="Proposed Amount"
            class="w-full p-3 border rounded-lg mb-4"
          />
          <div class="flex justify-end gap-4">
            <button
              (click)="closeModal()"
              class="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              (click)="sendProposal()"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MarketplaceComponent {
  searchQuery: string = '';
  selectedCategory: string = 'All';
  startups: any[] = [
    { name: 'GreenTech', category: 'Environment', description: 'AI-powered climate solutions.', id: 1 },
    { name: 'FinAI', category: 'Finance', description: 'AI-driven financial analytics.', id: 2 },
    { name: 'HealthSync', category: 'Health', description: 'Personalized AI-based healthcare.', id: 3 },
    { name: 'EduFuture', category: 'Education', description: 'AI-enhanced learning platform.', id: 4 },
    { name: 'AgriSmart', category: 'Environment', description: 'AI-driven precision farming.', id: 5 },
  ];
  displayedStartups: any[] = [];
  message: string = '';
  proposedAmount: number = 0;
  isModalOpen: boolean = false;
  selectedStartup: any;
  loading: boolean = false;
  categories = ['Environment', 'Finance', 'Health', 'Education'];

  constructor(private http: HttpClient, private router: Router) {
    this.loadMoreStartups();
  }

  get filteredStartups() {
    return this.startups.filter(
      (startup) =>
        (this.selectedCategory === 'All' || startup.category === this.selectedCategory) &&
        startup.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
      !this.loading
    ) {
      this.loadMoreStartups();
    }
  }

  loadMoreStartups() {
    this.loading = true;
    setTimeout(() => {
      const nextBatch = this.filteredStartups.slice(
        this.displayedStartups.length,
        this.displayedStartups.length + 3
      );
      this.displayedStartups = [...this.displayedStartups, ...nextBatch];
      this.loading = false;
    }, 1000);
  }

  openModal(startup: any) {
    this.selectedStartup = startup;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.message = '';
    this.proposedAmount = 0;
  }

  sendProposal() {
    const proposal = {
      investor: { id: 1 },
      startup: { id: this.selectedStartup.id },
      message: this.message,
      proposedAmount: this.proposedAmount,
      status: 'PENDING',
    };

    axios
      .post('http://localhost:8085/api/investment-requests', proposal)
      .then(() => this.closeModal())
      .catch((error) => console.error('Error sending proposal:', error));
  }

  viewStartupDetails(startupId: number) {
    this.router.navigate([`/startup/${startupId}`]);
  }
}
