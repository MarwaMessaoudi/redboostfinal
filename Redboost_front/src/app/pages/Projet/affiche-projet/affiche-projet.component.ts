import { Component, OnInit, SecurityContext } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ProjetService } from '../projet-service.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-affiche-projet',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './affiche-projet.component.html',
  styleUrls: ['./affiche-projet.component.scss']
})
export class AfficheProjetComponent implements OnInit {
  projets$!: Observable<any[]>;
  filteredProjets$!: Observable<any[]>;
  searchTerm: string = '';
  selectedSector: string = '';
  selectedLocation: string = '';
  sortField: string = 'creationDate';
  sortAscending: boolean = true;
  uniqueSectors: string[] = [];
  uniqueLocations: string[] = [];
  founderId: string = '1,2';

  imageErrorCount: { [key: string]: number } = {};

  constructor(
    private projetService: ProjetService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.projets$ = this.projetService.getProjetCardByFounderId(this.founderId);
    this.projets$.subscribe(projets => {
      console.log('Projects data:', projets);
      this.uniqueSectors = [...new Set(projets.map(p => p[2] || 'N/A'))];
      this.uniqueLocations = [...new Set(projets.map(p => p[3] || 'N/A'))];
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredProjets$ = this.projets$.pipe(
      map(projets => projets.filter(projet => {
        const matchesSearch = this.searchTerm.trim() === '' ||
          projet[0].toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          projet[2].toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          projet[3].toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesSector = this.selectedSector === '' || projet[2] === this.selectedSector;
        const matchesLocation = this.selectedLocation === '' || projet[3] === this.selectedLocation;
        return matchesSearch && matchesSector && matchesLocation;
      }).sort((a, b) => {
        const aValue = this.sortField === 'creationDate' ? a[4] : a[6];
        const bValue = this.sortField === 'creationDate' ? b[4] : b[6];
        if (this.sortAscending) {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      }))
    );
  }

  sanitizedImageUrl(url: string | undefined): string {
    if (!url || url === 'null' || url === 'ROLE_USER') {
      console.log('Invalid or null logoUrl:', url);
      return 'assets/no-image.png';
    }
    const baseUrl = 'http://localhost:8085';
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    return this.sanitizer.sanitize(SecurityContext.URL, fullUrl) || 'assets/no-image.png';
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    const src = img.src;
    const originalUrl = img.getAttribute('data-original-url') || 'unknown';
    this.imageErrorCount[src] = (this.imageErrorCount[src] || 0) + 1;
    if (this.imageErrorCount[src] <= 1) {
      console.error(`Image failed to load: ${originalUrl}`);
      img.src = 'assets/no-image.png';
    }
    img.onerror = null;
  }

  deleteProjet(projectId: number) {
    if (confirm('Are you sure you want to delete this project?')) {
      console.log('Deleting project with ID:', projectId);
      if (!projectId || isNaN(projectId)) {
        console.error('Invalid project ID:', projectId);
        alert('Invalid project ID.');
        return;
      }
      this.projetService.deleteProjet(projectId).subscribe({
        next: () => {
          console.log('Project deleted successfully');
          this.loadProjects();
        },
        error: (error) => {
          console.error('Error deleting project:', error);
          alert('Failed to delete project.');
          this.loadProjects();
        }
      });
    }
  }
}