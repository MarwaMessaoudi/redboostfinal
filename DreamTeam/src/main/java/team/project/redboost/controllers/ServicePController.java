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

    // Create a single service
    @PostMapping("")
    public ResponseEntity<ServiceP> createService(
            @RequestBody ServiceP service,
            @RequestParam Long projetId) {
        try {
            ServiceP newService = servicePService.createService(service, projetId);
            return new ResponseEntity<>(newService, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // Create standard packs
    @PostMapping("/standard/{projetId}")
    public ResponseEntity<List<ServiceP>> createStandardPacks(@PathVariable Long projetId) {
        try {
            List<ServiceP> standardPacks = servicePService.createStandardPacks(projetId);
            return new ResponseEntity<>(standardPacks, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // Get all services
    @GetMapping
    public ResponseEntity<List<ServiceP>> getAllServices() {
        List<ServiceP> services = servicePService.getAllServices();
        return new ResponseEntity<>(services, HttpStatus.OK);
    }

    // Get services by project ID
    @GetMapping("/project/{projetId}")
    public ResponseEntity<List<ServiceP>> getServicesByProjectId(@PathVariable Long projetId) {
        try {
            List<ServiceP> services = servicePService.getServicesByProjectId(projetId);
            return new ResponseEntity<>(services, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // Get a service by ID
    @GetMapping("/{id}")
    public ResponseEntity<ServiceP> getServiceById(@PathVariable Long id) {
        Optional<ServiceP> service = servicePService.getServiceById(id);
        return service.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // Update a service
    @PutMapping("/{id}")
    public ResponseEntity<ServiceP> updateService(
            @PathVariable Long id,
            @RequestBody ServiceP serviceDetails) {
        try {
            ServiceP updatedService = servicePService.updateService(id, serviceDetails);
            return new ResponseEntity<>(updatedService, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // Delete a service
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        try {
            servicePService.deleteService(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // Get services by project ID (alternative endpoint)
    @GetMapping("/getByIdProjet/{idProjet}")
    public ResponseEntity<List<ServiceP>> getServicesByProjetId(@PathVariable Long idProjet) {
        try {
            List<ServiceP> services = servicePService.getServicesByProjetId(idProjet);
            return ResponseEntity.ok(services);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
}