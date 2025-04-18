import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';
import { ProjetService } from '../../service/projet-service.service';
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
import { catchError, debounceTime, map, shareReplay, tap } from 'rxjs/operators';
import Swal from 'sweetalert2';

interface ProjectContacts {
  founder: User | null;
  entrepreneurs: User[];
  coaches: User[];
  investors: User[];
}

interface User {
  id: number;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
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
  changeDetection: ChangeDetectionStrategy.OnPush
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
  imageLoadStatus: { [key: string]: 'loaded' | 'failed' | 'loading' } = {};
  defaultImage = '/assets/images/default-logo.png'; // Ensure this file exists in src/assets/images

  constructor(
    private projetService: ProjetService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private cdr: ChangeDetectorRef
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
      this.cdr.markForCheck();
    });
  }

  loadCurrentUserId() {
    this.projetService.fetchCurrentUserId().subscribe({
      next: (userId) => {
        this.currentUserId = userId;
        this.loadProjects();
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
          if (!projet.id) projet.id = index + 1;
          return projet;
        });
      }),
      catchError((error) => {
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
        return of([]);
      }),
      shareReplay(1)
    );

    this.projets$.subscribe({
      next: (projets) => {
        this.uniqueSectors = [...new Set(projets.map(p => p.sector).filter(Boolean))];
        this.uniqueLocations = [...new Set(projets.map(p => p.location).filter(Boolean))];
        this.applyFilters();
        this.loadProjectContacts(projets);
        this.cdr.markForCheck();
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
        this.projetService.getProjectContacts(projectId).subscribe({
          next: (contacts) => {
            this.projetContacts[projectId] = {
              founder: contacts.founder,
              entrepreneurs: contacts.entrepreneurs || [],
              coaches: contacts.coaches || [],
              investors: contacts.investors || [],
            };
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error(`Failed to load contacts for project ${projectId}:`, error);
            this.projetContacts[projectId] = {
              founder: null,
              entrepreneurs: [],
              coaches: [],
              investors: [],
            };
            this.cdr.markForCheck();
          },
        });
      }
    });
  }

  loadPendingInvitations() {
    this.projetService.getPendingInvitations().subscribe({
      next: (invitations) => {
        this.pendingInvitations = invitations;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.pendingInvitations = [];
        Swal.fire({
          icon: 'error',
          title: 'Erreur!',
          text: error.message || 'Impossible de charger les invitations en attente.',
        });
        this.cdr.markForCheck();
      },
    });
  }

  applyFilters() {
    this.filteredProjets$ = this.projets$.pipe(
      debounceTime(100),
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
      ),
      tap(() => this.cdr.markForCheck())
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

  sanitizedImageUrl(url: string | null | undefined): SafeUrl {
    const baseUrl = 'http://localhost:8085';
    if (!url || url === 'null' || url.trim() === '' || this.imageLoadStatus[url] === 'failed') {
      return this.defaultImage;
    }
    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
    this.imageLoadStatus[fullUrl] = 'loading';
    return this.sanitizer.bypassSecurityTrustUrl(fullUrl);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    const src = img.getAttribute('data-original-url') || img.src;
    if (this.imageErrorCount[src]) {
      return;
    }
    this.imageErrorCount[src] = 1;
    this.imageLoadStatus[src] = 'failed';
    img.src = this.defaultImage;
    img.onerror = null;
    this.cdr.markForCheck();
  }

  onImageLoad(logoUrl: string) {
    this.imageLoadStatus[logoUrl] = 'loaded';
    this.cdr.markForCheck();
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
    this.projetService.acceptInvitation(projetId, this.currentUserId).subscribe({
      next: (response) => {
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
                  text: 'Invitation envoyée avec succès! Le collaborateur sera notifié.',
                });
                this.loadProjects();
                this.loadPendingInvitations();
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
    if (!projectId || !this.projetContacts[projectId]?.founder) return '';
    const founder = this.projetContacts[projectId].founder;
    return `${founder.firstName || ''} ${founder.lastName || ''} (${founder.email || ''})`.trim();
  }

  getEntrepreneursEmails(projectId: number | undefined): string {
    if (!projectId || !this.projetContacts[projectId]?.entrepreneurs?.length) return '';
    return this.projetContacts[projectId].entrepreneurs
      .map(u => `${u.firstName || ''} ${u.lastName || ''} (${u.email || ''})`.trim())
      .join(', ');
  }

  getCoachesEmails(projectId: number | undefined): string {
    if (!projectId || !this.projetContacts[projectId]?.coaches?.length) return '';
    return this.projetContacts[projectId].coaches
      .map(u => `${u.firstName || ''} ${u.lastName || ''} (${u.email || ''})`.trim())
      .join(', ');
  }

  getInvestorsEmails(projectId: number | undefined): string {
    if (!projectId || !this.projetContacts[projectId]?.investors?.length) return '';
    return this.projetContacts[projectId].investors
      .map(u => `${u.firstName || ''} ${u.lastName || ''} (${u.email || ''})`.trim())
      .join(', ');
  }

  getUserName(user: User | null): string {
    if (!user) return '';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0];
  }

  navigateToCreateProject() {
    this.router.navigate(['/addprojet']);
  }
}