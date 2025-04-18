package team.project.redboost.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import team.project.redboost.entities.ServiceP;
import team.project.redboost.services.ServicePService;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/services")
public class ServicePController {

    @Autowired
    private ServicePService servicePService;

    @Autowired
    private ObjectMapper objectMapper;

    // Create a single service with an image
    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ServiceP> createService(
            @RequestPart(name = "service") String serviceJson,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestParam Long projetId) throws IOException {
        ServiceP service = objectMapper.readValue(serviceJson, ServiceP.class);

        String base64Image = null;
        if (image != null && !image.isEmpty()) {
            base64Image = "data:" + image.getContentType() + ";base64," +
                    Base64.getEncoder().encodeToString(image.getBytes());
        }

        try {
            ServiceP newService = servicePService.createService(service, projetId, base64Image);
            return new ResponseEntity<>(newService, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // Create standard packs (no image upload here, predefined)
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

    // Update a service with an optional image
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ServiceP> updateService(
            @PathVariable Long id,
            @RequestPart(name = "service") String serviceJson,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        ServiceP serviceDetails = objectMapper.readValue(serviceJson, ServiceP.class);

        String base64Image = null;
        if (image != null && !image.isEmpty()) {
            base64Image = "data:" + image.getContentType() + ";base64," +
                    Base64.getEncoder().encodeToString(image.getBytes());
        }

        try {
            ServiceP updatedService = servicePService.updateService(id, serviceDetails, base64Image);
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
}