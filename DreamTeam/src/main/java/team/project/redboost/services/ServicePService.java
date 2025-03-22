package team.project.redboost.services;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import team.project.redboost.entities.Projet;
import team.project.redboost.entities.ServiceP;
import team.project.redboost.repositories.ProjetRepository;
import team.project.redboost.repositories.ServiceRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ServicePService {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ProjetRepository projetRepository;

    // Ajouter un service et l'associer à un Projet
    @Transactional
    public ServiceP createService(ServiceP service, Long projetId) {
        // Fetch the Projet by ID
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet not found with id: " + projetId));

        // Save the ServiceP first (if it doesn't have an ID)
        ServiceP savedService = serviceRepository.save(service);

        // Add the ServiceP to the Projet's services list
        projet.getServices().add(savedService);

        // Save the Projet (this will update the foreign key in the ServiceP table)
        projetRepository.save(projet);

        return savedService;
    }

    // Récupérer tous les services
    public List<ServiceP> getAllServices() {
        return serviceRepository.findAll();
    }

    // Récupérer un service par ID
    public Optional<ServiceP> getServiceById(Long id) {
        return serviceRepository.findById(id);
    }

    // Mettre à jour un service
    @Transactional
    public ServiceP updateService(Long id, ServiceP serviceDetails) {
        ServiceP service = serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));

        service.setName(serviceDetails.getName());
        service.setDescription(serviceDetails.getDescription());
        service.setPrice(serviceDetails.getPrice());
        service.setDuree(serviceDetails.getDuree());
        service.setModePrestation(serviceDetails.getModePrestation());
        service.setDisponible(serviceDetails.getDisponible());
        service.setTypeservice(serviceDetails.getTypeservice());
        service.setTemoinage(serviceDetails.getTemoinage());
        service.setLanguesdisponible(serviceDetails.getLanguesdisponible());
        service.setImage(serviceDetails.getImage());

        return serviceRepository.save(service);
    }

    // Supprimer un service
    @Transactional
    public void deleteService(Long id) {
        serviceRepository.deleteById(id);
    }
}