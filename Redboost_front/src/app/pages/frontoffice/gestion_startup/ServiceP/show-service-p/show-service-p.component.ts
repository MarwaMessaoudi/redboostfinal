import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceP, Pack } from '../../../../../models/ServiceP';
import { ServicePService } from '../service-p.service';

@Component({
    selector: 'app-show-service-p',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './show-service-p.component.html',
    styleUrls: ['./show-service-p.component.scss']
})
export class ShowServicePComponent implements OnInit {
    packs: Pack[] = [];
    newService: ServiceP = new ServiceP('', '', 0, 0, '', true, '');
    editService: ServiceP = new ServiceP('', '', 0, 0, '', true, '');
    showAddModal = false;
    showEditModal = false;
    selectedPack: Pack | null = null;
    errorMessage = '';
    successMessage = '';
    projetId = 1;
    isLoading = false;

    constructor(private servicePService: ServicePService) {}

    ngOnInit(): void {
        this.packs = [new Pack('Free', 'Basic plan for starters', [], 0, false), new Pack('Premium', 'Advanced plan for professionals', [], 49, false), new Pack('Gold', 'Best plan for enterprises', [], 99, true)];
        this.loadServices();
    }

    loadServices(): void {
        this.isLoading = true;
        this.servicePService.getServicesByProjectId(this.projetId).subscribe({
            next: (services: ServiceP[]) => {
                services.forEach((service) => {
                    const pack = this.packs.find((p) => p.name.toLowerCase() === service.typeservice?.toLowerCase());
                    if (pack) {
                        pack.services.push(service);
                    }
                });
                this.isLoading = false;
            },
            error: (err: any) => {
                this.errorMessage = `Failed to load services: ${err.message || err}`;
                this.isLoading = false;
                console.error('Load services error:', err);
            }
        });
    }

    openAddModalForPack(pack: Pack): void {
        this.selectedPack = pack;
        this.showAddModal = true;
        this.successMessage = '';
        this.errorMessage = '';
        this.newService = new ServiceP('', '', 0, 0, '', true, pack.name);
    }

    closeAddModal(): void {
        this.showAddModal = false;
        this.selectedPack = null;
        this.resetAddForm();
    }

    createService(): void {
        if (!this.newService.name || this.newService.price < 0 || this.newService.duree <= 0 || !this.newService.modePrestation || !this.newService.typeservice) {
            this.errorMessage = 'Please fill in all required fields with valid values.';
            return;
        }

        if (this.selectedPack) {
            this.isLoading = true;
            this.servicePService.createService(this.projetId, this.newService).subscribe({
                next: (service: ServiceP) => {
                    const newServiceToAdd = new ServiceP(service.name, service.description, service.price, service.duree, service.modePrestation, service.disponible, service.typeservice, service.temoinage, service.languesdisponible);
                    newServiceToAdd.id = service.id;
                    newServiceToAdd.isFavorite = service.isFavorite || false;
                    this.selectedPack!.services.push(newServiceToAdd);
                    this.successMessage = 'Service added successfully!';
                    this.errorMessage = '';
                    this.isLoading = false;
                    this.closeAddModal();
                },
                error: (err: any) => {
                    this.errorMessage = `Failed to add service: ${err.message || err}`;
                    this.successMessage = '';
                    this.isLoading = false;
                    console.error('Create service error:', err);
                }
            });
        }
    }

    openEditModal(pack: Pack, service: ServiceP): void {
        this.selectedPack = pack;
        this.showEditModal = true;
        this.successMessage = '';
        this.errorMessage = '';
        this.editService = { ...service };
    }

    closeEditModal(): void {
        this.showEditModal = false;
        this.selectedPack = null;
        this.resetEditForm();
    }

    updateService(): void {
        if (!this.editService.name || this.editService.price < 0 || this.editService.duree <= 0 || !this.editService.modePrestation || !this.editService.typeservice || !this.editService.id) {
            this.errorMessage = 'Please fill in all required fields with valid values.';
            return;
        }

        if (this.selectedPack) {
            this.isLoading = true;
            this.servicePService.updateService(this.editService.id, this.editService).subscribe({
                next: (updatedService: ServiceP) => {
                    const index = this.selectedPack!.services.findIndex((s) => s.id === updatedService.id);
                    if (index !== -1) {
                        this.selectedPack!.services[index] = updatedService;
                    }
                    this.successMessage = 'Service updated successfully!';
                    this.errorMessage = '';
                    this.isLoading = false;
                    this.closeEditModal();
                },
                error: (err: any) => {
                    this.errorMessage = `Failed to update service: ${err.message || err}`;
                    this.successMessage = '';
                    this.isLoading = false;
                    console.error('Update service error:', err);
                }
            });
        }
    }

    deleteService(pack: Pack, service: ServiceP): void {
        if (service.id && confirm('Are you sure you want to delete this service?')) {
            this.isLoading = true;
            this.servicePService.deleteService(service.id).subscribe({
                next: () => {
                    pack.services = pack.services.filter((s) => s.id !== service.id);
                    this.successMessage = 'Service deleted successfully!';
                    this.errorMessage = '';
                    this.isLoading = false;
                },
                error: (err: any) => {
                    this.errorMessage = `Failed to delete service: ${err.message || err}`;
                    this.successMessage = '';
                    this.isLoading = false;
                    console.error('Delete service error:', err);
                }
            });
        }
    }

    resetAddForm(): void {
        this.newService = new ServiceP('', '', 0, 0, '', true, this.selectedPack?.name || '');
        this.errorMessage = '';
        this.successMessage = '';
    }

    resetEditForm(): void {
        this.editService = new ServiceP('', '', 0, 0, '', true, this.selectedPack?.name || '');
        this.errorMessage = '';
        this.successMessage = '';
    }
}
