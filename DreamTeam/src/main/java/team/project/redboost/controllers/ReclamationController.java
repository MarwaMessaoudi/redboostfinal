package team.project.redboost.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import team.project.redboost.entities.Reclamation;
import team.project.redboost.services.ReclamationService;

import java.util.List;

@RestController
@RequestMapping("/api/reclamations")
@CrossOrigin(origins = "http://localhost:4200")
public class ReclamationController {

    @Autowired
    private ReclamationService reclamationService;

    // Récupérer toutes les réclamations
    @GetMapping("/getAllReclamations")
    public List<Reclamation> getAllReclamations() {
        return reclamationService.getAllReclamations();
    }

    // Récupérer une réclamation par ID
    @GetMapping("/{id}")
    public ResponseEntity<Reclamation> getReclamationById(@PathVariable Long id) {
        Reclamation reclamation = reclamationService.getReclamationById(id);
        return reclamation != null ? ResponseEntity.ok(reclamation) : ResponseEntity.notFound().build();
    }

    // Créer une nouvelle réclamation
    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<Reclamation> createReclamation(
            @RequestPart("reclamation") Reclamation reclamation,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        // Traitement de la réclamation et des fichiers
        // Par exemple, enregistrement des fichiers et mise à jour de l'entité réclamation
        return ResponseEntity.ok(reclamationService.createReclamation(reclamation));
    }

    // Supprimer une réclamation
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReclamation(@PathVariable Long id) {
        return reclamationService.deleteReclamation(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // Mettre à jour une réclamation
    @PutMapping("/{id}")
    public ResponseEntity<Reclamation> updateReclamation(
            @PathVariable Long id,
            @RequestBody Reclamation updatedReclamation) {
        Reclamation updated = reclamationService.updateReclamation(id, updatedReclamation);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }
}
