package team.project.redboost.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team.project.redboost.entities.ServiceP;
import team.project.redboost.services.ServicePService;

import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("/api/services")
public class ServicePController {

    @Autowired
    private ServicePService servicePService;

    // Ajouter un service et l'associer à un Projet
    @PostMapping("/AddServiceP")
    public ResponseEntity<ServiceP> createService(
            @RequestBody ServiceP service,
            @RequestParam Long projetId) { // Add projetId as a request parameter

        ServiceP newService = servicePService.createService(service, projetId);
        return new ResponseEntity<>(newService, HttpStatus.CREATED);
    }

    // Récupérer tous les services
    @GetMapping("/GetAllServices")
    public ResponseEntity<List<ServiceP>> getAllServices() {
        List<ServiceP> services = servicePService.getAllServices();
        return new ResponseEntity<>(services, HttpStatus.OK);
    }

    // Récupérer un service par ID
    @GetMapping("GetServiceById/{id}")
    public ResponseEntity<ServiceP> getServiceById(@PathVariable Long id) {
        Optional<ServiceP> service = servicePService.getServiceById(id);
        return service.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Mettre à jour un service
    @PutMapping("UpdateService/{id}")
    public ResponseEntity<ServiceP> updateService(@PathVariable Long id, @RequestBody ServiceP serviceDetails) {
        try {
            ServiceP updatedService = servicePService.updateService(id, serviceDetails);
            return new ResponseEntity<>(updatedService, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // Supprimer un service
    @DeleteMapping("DeleteService/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        servicePService.deleteService(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}