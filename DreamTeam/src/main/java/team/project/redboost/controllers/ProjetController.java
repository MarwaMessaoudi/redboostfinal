package team.project.redboost.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import team.project.redboost.entities.Projet;
import team.project.redboost.services.ProjetService;
import team.project.redboost.utils.FileStorageUtil;

import java.io.IOException;
import java.util.List;
import java.util.NoSuchElementException;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/projets")
public class ProjetController {

    private final ProjetService projetService;
    private final ObjectMapper objectMapper;

    public ProjetController(ProjetService projetService) {
        this.projetService = projetService;
        this.objectMapper = new ObjectMapper().registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @PostMapping(value = "/AddProjet", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createProjet(
            @RequestPart("projet") String projetJson,
            @RequestPart(value = "logourl", required = false) MultipartFile file
    ) {
        try {
            System.out.println("JSON Reçu : " + projetJson);
            System.out.println("File received: " + (file != null ? file.getOriginalFilename() : "null"));

            Projet projet = objectMapper.readValue(projetJson, Projet.class);
            String imageUrl = FileStorageUtil.saveFile(file);
            System.out.println("Image URL from FileStorageUtil: " + imageUrl);

            Projet savedProjet = projetService.createProjet(projet, imageUrl);
            System.out.println("Saved Projet logoUrl: " + savedProjet.getLogoUrl());
            return ResponseEntity.ok(savedProjet);
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erreur de parsing du JSON.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de l’enregistrement du fichier: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de la création du projet: " + e.getMessage());
        }
    }

    @PutMapping(value = "/UpdateProjet/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProjet(
            @PathVariable Long id,
            @RequestPart("projet") String projetJson,
            @RequestPart(value = "logourl", required = false) MultipartFile file
    ) {
        try {
            Projet projetDetails = objectMapper.readValue(projetJson, Projet.class);
            String imageUrl = FileStorageUtil.saveFile(file); // Save new file if provided
            Projet updatedProjet = projetService.updateProjet(id, projetDetails, imageUrl);
            return ResponseEntity.ok(updatedProjet);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erreur lors de l’enregistrement du fichier.");
        }
    }

    @GetMapping("/GetAll")
    public ResponseEntity<List<Projet>> getAllProjets() {
        return ResponseEntity.ok(projetService.getAllProjets());
    }

    @GetMapping("/GetProjet/{id}")
    public ResponseEntity<?> getProjetById(@PathVariable Long id) {
        try {
            Projet projet = projetService.getProjetById(id);
            return ResponseEntity.ok(projet);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/DeleteProjet/{id}")
    public ResponseEntity<?> deleteProjet(@PathVariable Long id) {
        try {
            projetService.deleteProjet(id);
            return ResponseEntity.ok("Projet supprimé avec succès !");
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/Getcardfounder/{founderId}")
    public ResponseEntity<List<Object[]>> getProjetCardByFounderId(@PathVariable String founderId) {
        List<Object[]> projectCards = projetService.getProjetCardByFounderId(founderId);
        return ResponseEntity.ok(projectCards);
    }
}