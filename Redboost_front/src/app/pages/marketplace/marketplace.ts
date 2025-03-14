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
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-center text-[#245C67] mb-8">Startup Marketplace</h1>

      <!-- Search and Filter Section -->
      <div class="flex flex-col gap-4 mb-8">
        <div class="relative w-full">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="filterStartups()"
            placeholder="Search by name, category, or description..."
            class="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0A4955] focus:border-[#0A4955]"
          />
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Category Checkboxes -->
        <div class="flex flex-wrap gap-4">
          <label *ngFor="let cat of categories" class="flex items-center space-x-2">
            <input
              type="checkbox"
              [checked]="selectedCategories.includes(cat)"
              (change)="toggleCategory(cat)"
              class="h-4 w-4 text-[#0A4955] border-gray-300 rounded focus:ring-[#0A4955]"
            />
            <span class="text-[#568086] text-sm">{{ cat }}</span>
          </label>
        </div>
      </div>

      <!-- Startup Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          *ngFor="let startup of displayedStartups"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200"
        >
          <div class="p-5">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-[#245C67]">{{ startup.name }}</h2>
              <span class="text-xs font-medium px-2 py-1 rounded-full bg-[#E88D9A] text-[#DB1E37]">
                {{ startup.category }}
              </span>
            </div>
            
            <p class="text-[#568086] text-sm mb-4 line-clamp-2">{{ startup.description }}</p>
            
            <div class="space-y-2 text-sm text-[#568086] mb-4">
              <div class="flex justify-between">
                <span>Funding Goal:</span>
                <span class="font-medium">{{ startup.fundingGoal | currency }}</span>
              </div>
              <div class="flex justify-between">
                <span>Location:</span>
                <span class="font-medium">{{ startup.location }}</span>
              </div>
              <div class="flex justify-between">
                <span>Team Size:</span>
                <span class="font-medium">{{ startup.teamSize }}</span>
              </div>
            </div>

            <div class="flex items-center mb-4">
              <div class="flex items-center text-[#E44D62]">
                <span *ngFor="let star of [1,2,3,4,5]" [class.fill-star]="star <= startup.rating">★</span>
              </div>
              <span class="ml-2 text-sm text-[#568086]">({{ startup.rating }}/5)</span>
            </div>

            <div class="flex gap-3">
              <button
                (click)="openModal(startup)"
                class="flex-1 bg-[#0A4955] text-white py-2 px-4 rounded-md hover:bg-[#245C67] transition-colors text-sm"
              >
                Send Proposal
              </button>
              <button
                (click)="viewStartupDetails(startup.id)"
                class="flex-1 bg-[#A0CED9] text-[#568086] py-2 px-4 rounded-md hover:bg-[#7BB4C2] transition-colors text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results Message -->
      <div *ngIf="displayedStartups.length === 0 && !loading" class="text-center text-[#568086] mt-6">
        No startups found matching your criteria.
      </div>

      <!-- Loading Indicator -->
      <div *ngIf="loading" class="text-center text-[#568086] mt-6 py-4">
        Loading more startups...
      </div>

      <!-- Modal -->
      <div
        *ngIf="isModalOpen"
        class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-[#245C67]">Send Proposal to {{ selectedStartup?.name }}</h3>
            <button (click)="closeModal()" class="text-[#568086] hover:text-[#245C67]">✕</button>
          </div>
          <textarea
            [(ngModel)]="message"
            placeholder="Your proposal message"
            class="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-[#0A4955]"
            rows="4"
          ></textarea>
          <input
            [(ngModel)]="proposedAmount"
            type="number"
            placeholder="Proposed Amount ($)"
            class="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-[#0A4955]"
          />
          <div class="flex justify-end gap-3">
            <button
              (click)="closeModal()"
              class="px-4 py-2 bg-[#A0CED9] rounded-md hover:bg-[#7BB4C2]"
            >
              Cancel
            </button>
            <button
              (click)="sendProposal()"
              class="px-4 py-2 bg-[#0A4955] text-white rounded-md hover:bg-[#245C67]"
            >
              Send Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .fill-star { color: #E44D62; }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class MarketplaceComponent {
  searchQuery: string = '';
  selectedCategories: string[] = [];
  startups: any[] = [];
  displayedStartups: any[] = [];
  message: string = '';
  proposedAmount: number = 0;
  isModalOpen: boolean = false;
  selectedStartup: any;
  loading: boolean = false;
  categories: string[] = [];

  constructor(private http: HttpClient, private router: Router) {
    this.fetchStartups();
  }

  fetchStartups() {
    this.loading = true;
    axios
      .get('http://localhost:8085/api/projets/GetAll') // Assumed endpoint
      .then((response) => {
        this.startups = response.data;
        this.categories = [...new Set(this.startups.map(startup => startup.category))]; // Dynamically generate categories
        this.filterStartups();
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error fetching startups:', error);
        this.loading = false;
      });
  }

  toggleCategory(category: string) {
    if (this.selectedCategories.includes(category)) {
      this.selectedCategories = this.selectedCategories.filter(cat => cat !== category);
    } else {
      this.selectedCategories.push(category);
    }
    this.filterStartups();
  }

  filterStartups() {
    const query = this.searchQuery.toLowerCase();
    this.displayedStartups = this.startups.filter(startup => {
      const matchesCategory = this.selectedCategories.length === 0 || this.selectedCategories.includes(startup.category);
      const matchesSearch = 
        startup.name.toLowerCase().includes(query) ||
        startup.category.toLowerCase().includes(query) ||
        startup.description.toLowerCase().includes(query) ||
        startup.location.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
    this.loading = false;
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
      !this.loading &&
      this.displayedStartups.length < this.startups.length
    ) {
      this.loadMoreStartups();
    }
  }

  loadMoreStartups() {
    this.loading = true;
    setTimeout(() => {
      const filtered = this.startups.filter(startup => {
        const matchesCategory = this.selectedCategories.length === 0 || this.selectedCategories.includes(startup.category);
        const matchesSearch = startup.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                              startup.category.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                              startup.description.toLowerCase().includes(this.searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
      const nextBatch = filtered.slice(
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