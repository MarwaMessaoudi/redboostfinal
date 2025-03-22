import { Component, OnInit, OnDestroy, SecurityContext } from '@angular/core';
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
import { DomSanitizer } from '@angular/platform-browser';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { Projet, Objectives, Statut } from '../../../models/Projet';
import { catchError, debounceTime, map } from 'rxjs/operators';
import Swal from 'sweetalert2';

interface ProjectContacts {
  founder: any | null;
  entrepreneurs: any[];
  coaches: any[];
  investors: any[];
}

interface User {
  id: number;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
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
  founderId: number = 1;
  email: string = '';
  pendingInvitations: Projet[] = [];
  projetContacts: { [key: number]: ProjectContacts } = {};
  private searchSubject = new Subject<string>();
  private token: string | null = null;
  imageErrorCount: { [key: string]: number } = {};

  constructor(
    private projetService: ProjetService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {
    console.log('Constructor: Initializing component');
  }

  ngOnInit() {
    console.log('ngOnInit: Starting initialization');
    this.token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken'); // Added to check refresh token
    console.log('Access Token:', this.token?.slice(0, 20) + '...');
    console.log('Refresh Token:', refreshToken || 'Not present'); // Log refresh token presence
    if (this.token) {
      console.log('Token retrieved from localStorage:', this.token.slice(0, 20) + '...');
      this.email = this.getEmailFromToken(this.token);
      console.log('Email extracted from token:', this.email);
      this.founderId = this.getFounderIdFromToken(this.token); // Use dynamic ID from token
      console.log('Founder ID set to:', this.founderId);
      this.setupSearchDebounce();
      this.loadProjects();
      this.loadPendingInvitations();
    } else {
      console.log('No token found in localStorage, redirecting to login...');
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy() {
    this.searchSubject.unsubscribe();
    console.log('ngOnDestroy: Unsubscribed from search subject');
  }

  getEmailFromToken(token: string): string {
    try {
      const decoded: any = JSON.parse(atob(token.split('.')[1]));
      console.log('Decoded token:', decoded);
      return decoded.email || decoded.sub || 'baylassen.elabed@esprit.tn'; // Prefer email field
    } catch (error) {
      console.error('Error decoding token:', error);
      return 'baylassen.elabed@esprit.tn';
    }
  }

  getFounderIdFromToken(token: string): number {
    try {
      const decoded: any = JSON.parse(atob(token.split('.')[1]));
      const id = decoded.id || decoded.user_id || decoded.sub; // Adjust based on your token structure
      if (typeof id === 'number') {
        return id;
      } else if (typeof id === 'string' && !isNaN(parseInt(id, 10))) {
        return parseInt(id, 10);
      }
      const storedId = localStorage.getItem('userId');
      if (storedId && !isNaN(parseInt(storedId, 10))) {
        return parseInt(storedId, 10);
      }
      console.warn('No numeric ID in token or storage, using fallback ID: 2');
      return 2; // Keep your hardcoded fallback
    } catch (error) {
      console.error('Error decoding token for founderId:', error);
      console.warn('Using fallback founderId: 2');
      return 2;
    }
  }

  setupSearchDebounce() {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      console.log('Search term changed:', this.searchTerm);
      this.applyFilters();
    });
  }

  loadProjects() {
    if (!this.token || !this.founderId) {
      console.error('No token or founderId available');
      this.router.navigate(['/login']);
      return;
    }

    console.log('Fetching projects for founderId:', this.founderId);

    this.projets$ = this.projetService.getProjetCardByFounderId(this.founderId.toString()).pipe(
      map((projets: any[]) => {
        console.log('Raw response from backend:', projets);
        if (!projets || !Array.isArray(projets)) {
          console.warn('Invalid response, returning empty array');
          return [];
        }
        return projets.map((projet: any, index) => {
          const proj = new Projet(
            projet.name || projet[0] || 'Unnamed Project',
            projet.sector || projet[2] || 'N/A',
            projet.type || 'Unknown',
            projet.creationDate || projet[4] || 'N/A',
            projet.description || '',
            projet.objectives || Objectives.COURT_TERME,
            projet.status || Statut.EN_DEVELOPPEMENT,
            projet.globalScore || projet[6] || 0,
            projet.location || projet[3] || 'N/A',
            projet.logoUrl || projet[1] || '',
            projet.websiteUrl || projet[5] || '',
            projet.revenue || 0,
            projet.numberOfEmployees || 0,
            projet.nbFemaleEmployees || 0,
            projet.lastUpdated || '',
            projet.associatedSectors || '',
            projet.technologiesUsed || '',
            projet.fundingGoal || 0,
            projet.lastEvaluationDate || '',
            projet.produits || [],
            projet.services || [],
            projet.folders || [],
            projet.phases || [],
            projet.founder || null,
            projet.entrepreneurs || [],
            projet.coaches || [],
            projet.investors || [],
            projet.pendingCollaborator || null
          );
          proj.id = projet.id || projet[7] || index + 1;
          return proj;
        });
      }),
      catchError((error) => {
        console.error('HTTP error:', error);
        if (error.status === 401) {
          console.log('Unauthorized, redirecting to login...');
          this.router.navigate(['/login']);
        }
        return of([]);
      })
    );

    this.projets$.subscribe({
      next: (projets) => {
        console.log('Mapped projects:', projets);
        this.uniqueSectors = [...new Set(projets.map(p => p.sector).filter(Boolean))];
        this.uniqueLocations = [...new Set(projets.map(p => p.location).filter(Boolean))];
        this.applyFilters();
        this.loadProjectContacts(projets);
      },
      error: (error) => {
        console.error('Subscription error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur!',
          text: 'Échec du chargement des projets.',
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            confirmButton: 'swal-custom-button'
          },
          buttonsStyling: false
        });
      },
      complete: () => console.log('Projects subscription completed')
    });
  }

  loadProjectContacts(projets: Projet[]) {
    projets.forEach(projet => {
      const projectId = projet.id ?? 0;
      if (projectId) {
        this.projetService.getProjetById(projectId).subscribe({
          next: (fullProjet) => {
            this.projetContacts[projectId] = {
              founder: fullProjet.founder || null,
              entrepreneurs: fullProjet.entrepreneurs || [],
              coaches: fullProjet.coaches || [],
              investors: fullProjet.investors || [],
            };
          },
          error: (error) => {
            console.error(`loadProjectContacts: Error for project ${projectId}:`, error);
            this.projetContacts[projectId] = { founder: null, entrepreneurs: [], coaches: [], investors: [] };
          }
        });
      }
    });
  }

  loadPendingInvitations() {
    this.projetService.getPendingInvitations().subscribe({
      next: (invitations) => {
        this.pendingInvitations = invitations.map((inv) => {
          const proj = new Projet(
            inv.name || 'Unnamed Project',
            inv.sector || 'N/A',
            inv.type || 'Unknown',
            inv.creationDate || 'N/A',
            inv.description || '',
            inv.objectives || Objectives.COURT_TERME,
            inv.status || Statut.EN_DEVELOPPEMENT,
            inv.globalScore || 0,
            inv.location || 'N/A',
            inv.logoUrl || '',
            inv.websiteUrl || '',
            inv.revenue || 0,
            inv.numberOfEmployees || 0,
            inv.nbFemaleEmployees || 0,
            inv.lastUpdated || '',
            inv.associatedSectors || '',
            inv.technologiesUsed || '',
            inv.fundingGoal || 0,
            inv.lastEvaluationDate || '',
            inv.produits || [],
            inv.services || [],
            inv.folders || [],
            inv.phases || [],
            inv.founder || null,
            inv.entrepreneurs || [],
            inv.coaches || [],
            inv.investors || [],
            inv.pendingCollaborator || null
          );
          proj.id = inv.id || 0;
          return proj;
        });
        console.log('loadPendingInvitations: Invitations loaded:', this.pendingInvitations);
      },
      error: (error) => {
        console.error('loadPendingInvitations: Error:', error);
        this.pendingInvitations = [];
        Swal.fire({
          icon: 'error',
          title: 'Erreur!',
          text: error.message || 'Impossible de charger les invitations en attente.',
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            confirmButton: 'swal-custom-button'
          },
          buttonsStyling: false
        });
      }
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

  sanitizedImageUrl(url: string): string {
    const baseUrl = 'http://localhost:8085';
    if (!url || url === 'null' || url.trim() === '') {
      console.log('Invalid or null logoUrl:', url);
      return 'assets/no-image.png';
    }
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    console.log(`Constructed image URL: ${fullUrl}`);
    return this.sanitizer.sanitize(SecurityContext.URL, fullUrl) || 'assets/no-image.png';
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    const src = img.src;
    this.imageErrorCount[src] = (this.imageErrorCount[src] || 0) + 1;
    if (this.imageErrorCount[src] <= 1) {
      console.error(`Image failed to load: ${src}`);
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
      customClass: {
        popup: 'swal-custom-popup',
        title: 'swal-custom-title',
        confirmButton: 'swal-custom-button',
        cancelButton: 'swal-custom-cancel-button'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        this.projetService.deleteProjet(projectId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Supprimé!',
              text: 'Le projet a été supprimé.',
              customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title',
                confirmButton: 'swal-custom-button'
              },
              buttonsStyling: false
            });
            this.loadProjects();
          },
          error: (error) => Swal.fire({
            icon: 'error',
            title: 'Erreur!',
            text: 'Échec de la suppression.',
            customClass: {
              popup: 'swal-custom-popup',
              title: 'swal-custom-title',
              confirmButton: 'swal-custom-button'
            },
            buttonsStyling: false
          })
        });
      }
    });
  }

  acceptInvitation(projetId: number | undefined) {
    if (!projetId || projetId === 0) {
      console.error('acceptInvitation: Invalid project ID:', projetId);
      Swal.fire({
        icon: 'error',
        title: 'Erreur!',
        text: 'ID du projet non valide.',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-button'
        },
        buttonsStyling: false
      });
      return;
    }
    if (!this.founderId) {
      console.error('acceptInvitation: No founderId available');
      Swal.fire({
        icon: 'error',
        title: 'Erreur!',
        text: 'Utilisateur non identifié. Veuillez vous reconnecter.',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-button'
        },
        buttonsStyling: false
      });
      return;
    }
    this.projetService.acceptInvitation(projetId, this.founderId).subscribe({
      next: (updatedProjet) => {
        console.log(`Invitation accepted for project ${projetId}`);
        Swal.fire({
          icon: 'success',
          title: 'Succès!',
          text: 'Invitation acceptée avec succès!',
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            confirmButton: 'swal-custom-button'
          },
          buttonsStyling: false
        });
        this.loadPendingInvitations();
        this.loadProjects();
      },
      error: (error) => {
        console.error('Accept invitation error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur!',
          text: error.message || 'Échec de l\'acceptation de l\'invitation.',
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            confirmButton: 'swal-custom-button'
          },
          buttonsStyling: false
        });
      }
    });
  }

  declineInvitation(projetId: number | undefined) {
    if (!projetId || projetId === 0) {
      console.error('declineInvitation: Invalid project ID:', projetId);
      Swal.fire({
        icon: 'error',
        title: 'Erreur!',
        text: 'ID du projet non valide.',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-button'
        },
        buttonsStyling: false
      });
      return;
    }
    if (!this.founderId) {
      console.error('declineInvitation: No founderId available');
      Swal.fire({
        icon: 'error',
        title: 'Erreur!',
        text: 'Utilisateur non identifié. Veuillez vous reconnecter.',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-button'
        },
        buttonsStyling: false
      });
      return;
    }
    this.projetService.declineInvitation(projetId, this.founderId).subscribe({
      next: (updatedProjet) => {
        console.log(`Invitation declined for project ${projetId}`);
        Swal.fire({
          icon: 'success',
          title: 'Succès!',
          text: 'Invitation refusée avec succès!',
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            confirmButton: 'swal-custom-button'
          },
          buttonsStyling: false
        });
        this.loadPendingInvitations();
      },
      error: (error) => {
        console.error('Decline invitation error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur!',
          text: error.message || 'Échec du refus de l\'invitation.',
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            confirmButton: 'swal-custom-button'
          },
          buttonsStyling: false
        });
      }
    });
  }

  inviteUser(projetId: number | undefined) {
    if (!projetId) {
      console.error('inviteUser: No project ID provided');
      Swal.fire({
        icon: 'error',
        title: 'Erreur!',
        text: 'ID du projet non défini.',
        customClass: {
          popup: 'swal-custom-popup',
          title: 'swal-custom-title',
          confirmButton: 'swal-custom-button'
        },
        buttonsStyling: false
      });
      return;
    }
    console.log(`inviteUser: Fetching eligible collaborators for project ID ${projetId}`);
    this.projetService.getEligibleCollaborators(projetId).subscribe({
      next: (users: User[]) => {
        console.log('Eligible users received:', users);
        if (users.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Info',
            text: 'Aucun collaborateur éligible trouvé.',
            customClass: {
              popup: 'swal-custom-popup',
              title: 'swal-custom-title',
              confirmButton: 'swal-custom-button'
            },
            buttonsStyling: false
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
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            confirmButton: 'swal-custom-button',
            cancelButton: 'swal-custom-cancel-button',
            htmlContainer: 'swal-custom-html'
          },
          buttonsStyling: false,
          preConfirm: () => {
            const selectedUserId = (document.getElementById('userSelect') as HTMLSelectElement).value;
            if (!selectedUserId) {
              Swal.showValidationMessage('Veuillez sélectionner un utilisateur.');
              return false;
            }
            return parseInt(selectedUserId, 10);
          }
        }).then((result) => {
          if (result.isConfirmed && result.value) {
            console.log(`Sending invitation for project ${projetId} to user ${result.value}`);
            this.projetService.inviteCollaborator(projetId, result.value).subscribe({
              next: () => {
                Swal.fire({
                  icon: 'success',
                  title: 'Succès!',
                  text: 'Invitation envoyée avec succès!',
                  customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title',
                    confirmButton: 'swal-custom-button'
                  },
                  buttonsStyling: false
                });
                this.loadProjects();
              },
              error: (error) => {
                console.error('Invite collaborator error:', error);
                Swal.fire({
                  icon: 'error',
                  title: 'Erreur!',
                  text: error.message || 'Échec de l\'envoi de l\'invitation.',
                  customClass: {
                    popup: 'swal-custom-popup',
                    title: 'swal-custom-title',
                    confirmButton: 'swal-custom-button'
                  },
                  buttonsStyling: false
                });
              }
            });
          }
        });
      },
      error: (error) => {
        console.error('Get eligible collaborators error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur!',
          text: error.message || 'Impossible de charger les collaborateurs éligibles.',
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            confirmButton: 'swal-custom-button'
          },
          buttonsStyling: false
        });
      }
    });
  }

  getCardColorClass(index: number): string {
    return index % 2 === 0 ? 'card-red-border' : 'card-blue-border';
  }

  getFounderEmail(projectId: number | undefined): string {
    return projectId && this.projetContacts[projectId]?.founder?.email || 'N/A';
  }

  getEntrepreneursEmails(projectId: number | undefined): string {
    if (!projectId) return 'N/A';
    const entrepreneurs = this.projetContacts[projectId]?.entrepreneurs;
    return entrepreneurs?.length ? entrepreneurs.map(e => e.email).join(', ') : 'N/A';
  }

  getCoachesEmails(projectId: number | undefined): string {
    if (!projectId) return 'N/A';
    const coaches = this.projetContacts[projectId]?.coaches;
    return coaches?.length ? coaches.map(c => c.email).join(', ') : 'N/A';
  }

  getInvestorsEmails(projectId: number | undefined): string {
    if (!projectId) return 'N/A';
    const investors = this.projetContacts[projectId]?.investors;
    return investors?.length ? investors.map(i => i.email).join(', ') : 'N/A';
  }
}