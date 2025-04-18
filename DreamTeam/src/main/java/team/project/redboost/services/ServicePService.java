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

    // Create a single service with an image and associate it with a project
    @Transactional
    public ServiceP createService(ServiceP service, Long projetId, String base64Image) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projetId));
        service.setImage(base64Image);
        ServiceP savedService = serviceRepository.save(service);
        projet.getServices().add(savedService);
        projetRepository.save(projet);
        return savedService;
    }

    // Automatically create three standard services (Free, Premium, Gold) with vague text
    @Transactional
    public List<ServiceP> createStandardPacks(Long projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projetId));

        // Define the three standard services with vague, generic text
        ServiceP freePack = new ServiceP();
        freePack.setName("Free Standard");
        freePack.setDescription("Basic offering with standard features");
        freePack.setPrice(0.0);
        freePack.setDuree(30);
        freePack.setModePrestation("Online");
        freePack.setDisponible(true);
        freePack.setTypeservice("Free");

        ServiceP premiumPack = new ServiceP();
        premiumPack.setName("Premium Standard");
        premiumPack.setDescription("Enhanced offering with additional benefits");
        premiumPack.setPrice(99.99);
        premiumPack.setDuree(90);
        premiumPack.setModePrestation("Online/In-person");
        premiumPack.setDisponible(true);
        premiumPack.setTypeservice("Premium");

        ServiceP goldPack = new ServiceP();
        goldPack.setName("Gold Standard");
        goldPack.setDescription("Top-tier offering with premium advantages");
        goldPack.setPrice(199.99);
        goldPack.setDuree(180);
        goldPack.setModePrestation("In-person");
        goldPack.setDisponible(true);
        goldPack.setTypeservice("Gold");

        // Save the three packs and associate with the project
        List<ServiceP> standardPacks = List.of(freePack, premiumPack, goldPack);
        List<ServiceP> savedPacks = serviceRepository.saveAll(standardPacks);
        projet.getServices().addAll(savedPacks);
        projetRepository.save(projet);

        return savedPacks;
    }

    // Get all services
    public List<ServiceP> getAllServices() {
        return serviceRepository.findAll();
    }

    // Get services by project ID
    public List<ServiceP> getServicesByProjectId(Long projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with id: " + projetId));
        return projet.getServices();
    }

    // Get a service by ID
    public Optional<ServiceP> getServiceById(Long id) {
        return serviceRepository.findById(id);
    }

    // Update a service with an optional image
    @Transactional
    public ServiceP updateService(Long id, ServiceP serviceDetails, String base64Image) {
        ServiceP service = serviceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Service not found with id: " + id));

        service.setName(serviceDetails.getName());
        service.setDescription(serviceDetails.getDescription());
        service.setPrice(serviceDetails.getPrice());
        service.setDuree(serviceDetails.getDuree());
        service.setModePrestation(serviceDetails.getModePrestation());
        service.setDisponible(serviceDetails.getDisponible());
        service.setTypeservice(serviceDetails.getTypeservice());
        service.setTemoinage(serviceDetails.getTemoinage());
        service.setLanguesdisponible(serviceDetails.getLanguesdisponible());
        if (base64Image != null && !base64Image.isEmpty()) {
            service.setImage(base64Image);
        }
        return serviceRepository.save(service);
    }

    // Delete a service
    @Transactional
    public void deleteService(Long id) {
        ServiceP service = serviceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Service not found with id: " + id));
        serviceRepository.deleteById(id);
    }
}