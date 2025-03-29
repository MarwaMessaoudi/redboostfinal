import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { ProjetService } from '../projet-service.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { Projet } from '../../../models/Projet'; 
import { catchError, debounceTime, map } from 'rxjs/operators';
import Swal from 'sweetalert2';

interface ProjectContacts {
  founder: number | null;
  entrepreneurs: number[];
  coaches: number[];
  investors: number[];
}

interface PendingInvitation {
  projectId: number;
  projectName: string;
  invitorEmail: string;
  invitorName: string;
}

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
    MatInputModule,
    FormsModule,
    RouterModule,
    MatTooltipModule,
    MatTabsModule,
  ],
  templateUrl: './affiche-projet.component.html',
  styleUrls: ['./affiche-projet.component.scss'],
})
export class AfficheProjetComponent implements OnInit, OnDestroy {
  projets$!: Observable<Projet[]>;
  filteredProjets$!: Observable<Projet[]>;
  searchTerm: string = '';
  selectedSector: string = '';
  selectedLocation: string = '';
  sortField: string = 'creationDate';
  sortAscending: boolean = true;
  uniqueSectors: string[] = [];
  uniqueLocations: string[] = [];
  currentUserId: number | null = null;
  pendingInvitations: PendingInvitation[] = [];
  projetContacts: { [key: number]: ProjectContacts } = {};
  private searchSubject = new Subject<string>();
  imageErrorCount: { [key: string]: number } = {};

  constructor(
    private projetService: ProjetService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit() {
    this.setupSearchDebounce();
    this.loadCurrentUserId();
    this.loadPendingInvitations();
  }

  ngOnDestroy() {
    this.searchSubject.unsubscribe();
  }

  setupSearchDebounce() {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.applyFilters();
    });
  }
  loadCurrentUserId() {
    console.log('loadCurrentUserId - Starting');
    this.projetService.fetchCurrentUserId().subscribe({
        next: (userId) => {
            this.currentUserId = userId;
            console.log('Loaded currentUserId:', this.currentUserId); // Should be 3
            this.loadProjects(); // Load projects after userId is set
        },
        error: (error) => {
            console.error('Error loading user ID:', error.message);
            Swal.fire({
                icon: 'error',
                title: 'Erreur!',
                text: 'Impossible de charger l\'ID utilisateur. Veuillez vous reconnecter.',
            });
            this.router.navigate(['/login']);
        },
    });
}

  loadProjects() {
    this.projets$ = this.projetService.getUserProjects().pipe(
      map((projets: Projet[]) => {
        return projets.map((projet, index) => {
          if (!projet.id) projet.id = index + 1; // Fallback ID
          return projet;
        });
      }),
      catchError((error) => {
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
        return of([]);
      })
    );

    this.projets$.subscribe({
      next: (projets) => {
        this.uniqueSectors = [...new Set(projets.map(p => p.sector).filter(Boolean))];
        this.uniqueLocations = [...new Set(projets.map(p => p.location).filter(Boolean))];
        this.applyFilters();
        this.loadProjectContacts(projets);
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur!',
          text: 'Échec du chargement des projets.',
        });
      },
    });
  }

  loadProjectContacts(projets: Projet[]) {
    projets.forEach(projet => {
      const projectId = projet.id ?? 0;
      if (projectId) {
        this.projetContacts[projectId] = {
          founder: projet.founder,
          entrepreneurs: projet.entrepreneurs,
          coaches: projet.coaches,
          investors: projet.investors,
        };
      }
    });
  }

  loadPendingInvitations() {
    this.projetService.getPendingInvitations().subscribe({
      next: (invitations) => {
        this.pendingInvitations = invitations;
      },
      error: (error) => {
        this.pendingInvitations = [];
        Swal.fire({
          icon: 'error',
          title: 'Erreur!',
          text: error.message || 'Impossible de charger les invitations en attente.',
        });
      },
    });
  }

  applyFilters() {
    this.filteredProjets$ = this.projets$.pipe(
      map(projets =>
        projets
          .filter(projet => {
            const matchesSearch =
              !this.searchTerm ||
              projet.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              projet.sector.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              projet.location.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesSector = !this.selectedSector || projet.sector === this.selectedSector;
            const matchesLocation = !this.selectedLocation || projet.location === this.selectedLocation;
            return matchesSearch && matchesSector && matchesLocation;
          })
          .sort((a, b) => {
            const aValue = this.sortField === 'creationDate' ? a.creationDate || '' : a.globalScore || 0;
            const bValue = this.sortField === 'creationDate' ? b.creationDate || '' : b.globalScore || 0;
            return this.sortAscending ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
          })
      )
    );
  }

  onSearchChange() { this.searchSubject.next(this.searchTerm); }
  onSectorChange() { this.applyFilters(); }
  onLocationChange() { this.applyFilters(); }
  onSortFieldChange() { this.applyFilters(); }
  toggleSortDirection() {
    this.sortAscending = !this.sortAscending;
    this.applyFilters();
  }

  sanitizedImageUrl(url: string): SafeUrl {
    const baseUrl = 'http://localhost:8085';
    if (!url || url === 'null' || url.trim() === '') {
      return this.sanitizer.bypassSecurityTrustUrl('assets/no-image.png');
    }
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    return this.sanitizer.bypassSecurityTrustUrl(fullUrl);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    const src = img.src;
    this.imageErrorCount[src] = (this.imageErrorCount[src] || 0) + 1;
    if (this.imageErrorCount[src] <= 1) {
      img.src = 'assets/no-image.png';
    }
    img.onerror = null;
  }

  deleteProjet(projectId: number | undefined) {
    if (!projectId) return;
    Swal.fire({
      title: 'Êtes-vous sûr?',
      text: 'Vous ne pourrez pas revenir en arrière!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Non, annuler',
    }).then(result => {
      if (result.isConfirmed) {
        this.projetService.deleteProjet(projectId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Supprimé!',
              text: 'Le projet a été supprimé.',
            });
            this.loadProjects();
          },
          error: () => Swal.fire({
            icon: 'error',
            title: 'Erreur!',
            text: 'Échec de la suppression.',
          }),
        });
      }
    });
  }

  acceptInvitation(projetId: number | undefined) {
    if (!projetId || projetId === 0 || !this.currentUserId) {
        Swal.fire({
            icon: 'error',
            title: 'Erreur!',
            text: 'ID du projet ou utilisateur non valide.',
        });
        return;
    }
    console.log('Accepting invitation for projetId:', projetId, 'userId:', this.currentUserId);
    this.projetService.acceptInvitation(projetId, this.currentUserId).subscribe({
        next: (response) => {
            console.log('Invitation accepted:', response);
            Swal.fire({
                icon: 'success',
                title: 'Succès!',
                text: 'Invitation acceptée avec succès!',
            });
            this.loadPendingInvitations();
            this.loadProjects();
        },
        error: (error) => {
            let errorMessage = typeof error.message === 'string' ? error.message : 
                              error.error?.message || 'Échec de l\'acceptation de l\'invitation.';
            if (error.status === 400) {
                errorMessage = typeof error.error === 'string' ? error.error : 
                               error.error?.message || 'Requête invalide. Vérifiez que vous êtes autorisé à accepter cette invitation.';
            }
            Swal.fire({
                icon: 'error',
                title: 'Erreur!',
                text: errorMessage,
            });
        },
    });
}

declineInvitation(projetId: number | undefined) {
    if (!projetId || projetId === 0 || !this.currentUserId) {
        Swal.fire({
            icon: 'error',
            title: 'Erreur!',
            text: 'ID du projet ou utilisateur non valide.',
        });
        return;
    }
    this.projetService.declineInvitation(projetId, this.currentUserId).subscribe({
        next: () => {
            Swal.fire({
                icon: 'success',
                title: 'Succès!',
                text: 'Invitation refusée avec succès!',
            });
            this.loadPendingInvitations();
        },
        error: (error) => {
            Swal.fire({
                icon: 'error',
                title: 'Erreur!',
                text: error.message || 'Échec du refus de l\'invitation.',
            });
        },
    });
}

  inviteUser(projetId: number | undefined) {
    if (!projetId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur!',
        text: 'ID du projet non défini.',
      });
      return;
    }
    this.projetService.getEligibleCollaborators(projetId).subscribe({
      next: (users) => {
        if (users.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Info',
            text: 'Aucun collaborateur éligible trouvé.',
          });
          return;
        }
        const userOptions = users.map(user => ({
          value: user.id,
          text: `${user.firstName || ''} ${user.lastName || ''} (${user.email})`.trim(),
        }));
        Swal.fire({
          title: 'Inviter un Collaborateur',
          html: `
            <select id="userSelect" class="swal-custom-select">
              <option value="">Sélectionnez un utilisateur</option>
              ${userOptions.map(option => `<option value="${option.value}">${option.text}</option>`).join('')}
            </select>
          `,
          showCancelButton: true,
          confirmButtonText: 'Envoyer l\'invitation',
          cancelButtonText: 'Annuler',
          preConfirm: () => {
            const selectedUserId = (document.getElementById('userSelect') as HTMLSelectElement).value;
            if (!selectedUserId) {
              Swal.showValidationMessage('Veuillez sélectionner un utilisateur.');
              return false;
            }
            return parseInt(selectedUserId, 10);
          },
        }).then((result) => {
          if (result.isConfirmed && result.value) {
            this.projetService.inviteCollaborator(projetId, result.value).subscribe({
              next: () => {
                Swal.fire({
                  icon: 'success',
                  title: 'Succès!',
                  text: 'Invitation envoyée avec succès!',
                });
                this.loadProjects();
              },
              error: (error) => {
                Swal.fire({
                  icon: 'error',
                  title: 'Erreur!',
                  text: error.message || 'Échec de l\'envoi de l\'invitation.',
                });
              },
            });
          }
        });
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur!',
          text: error.message || 'Impossible de charger les collaborateurs éligibles.',
        });
      },
    });
  }

  getCardColorClass(index: number): string {
    return index % 2 === 0 ? 'card-red-border' : 'card-blue-border';
  }

  getFounderEmail(projectId: number | undefined): string {
    return projectId && this.projetContacts[projectId]?.founder ? this.projetContacts[projectId].founder.toString() : 'N/A';
  }

  getEntrepreneursEmails(projectId: number | undefined): string {
    if (!projectId) return 'N/A';
    const entrepreneurs = this.projetContacts[projectId]?.entrepreneurs;
    return entrepreneurs?.length ? entrepreneurs.join(', ') : 'N/A';
  }

  getCoachesEmails(projectId: number | undefined): string {
    if (!projectId) return 'N/A';
    const coaches = this.projetContacts[projectId]?.coaches;
    return coaches?.length ? coaches.join(', ') : 'N/A';
  }

  getInvestorsEmails(projectId: number | undefined): string {
    if (!projectId) return 'N/A';
    const investors = this.projetContacts[projectId]?.investors;
    return investors?.length ? investors.join(', ') : 'N/A';
  }
}