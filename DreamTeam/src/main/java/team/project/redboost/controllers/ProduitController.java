package team.project.redboost.controllers;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team.project.redboost.entities.Produit;
import team.project.redboost.entities.Projet;
import team.project.redboost.services.ProduitService;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/produits")
public class ProduitController {

    @Autowired
    private ProduitService produitService;

    // Ajouter un produit et l'associer à un Projet
    @PostMapping(value = "/AddProjet", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<?> createProjet(
            @RequestPart("projet") String projetJson, // JSON as String
            @RequestPart(value = "file", required = false) MultipartFile file) {

        try {
            // Convert JSON String to Projet object
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule()); // Enables LocalDate parsing
            objectMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

            Projet projet = objectMapper.readValue(projetJson, Projet.class);

            // Now 'projet' is properly parsed with LocalDate
            return ResponseEntity.ok("Projet créé avec succès : " + projet.getName());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erreur : " + e.getMessage());
        }
    }


    // Récupérer tous les produits
    @GetMapping("/GetAllProduits")
    public ResponseEntity<List<Produit>> getAllProduits() {
        List<Produit> produits = produitService.getAllProduits();
        return ResponseEntity.ok(produits);
    }

    // Récupérer un produit par ID
    @GetMapping("/GetProduitById/{id}")
    public ResponseEntity<Produit> getProduitById(@PathVariable Long id) {
        Optional<Produit> produit = produitService.getProduitById(id);
        return produit.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Mettre à jour un produit
    @PutMapping("/UpdateProduit/{id}")
    public ResponseEntity<Produit> updateProduit(@PathVariable Long id, @RequestBody Produit produitDetails) {
        Produit updatedProduit = produitService.updateProduit(id, produitDetails);
        return ResponseEntity.ok(updatedProduit);
    }

    // Supprimer un produit
    @DeleteMapping("/DeleteProduit/{id}")
    public ResponseEntity<Void> deleteProduit(@PathVariable Long id) {
        produitService.deleteProduit(id);
        return ResponseEntity.noContent().build();
    }
}