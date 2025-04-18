package team.project.redboost.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import team.project.redboost.entities.Produit;
import team.project.redboost.services.ProduitService;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/produits")
public class ProduitController {

    @Autowired
    private ProduitService produitService;

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping(value = "/AddProduit/{projetId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Produit> createProduit(
            @PathVariable Long projetId,
            @RequestPart(name = "produit") String produitJson,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        Produit produit = objectMapper.readValue(produitJson, Produit.class);

        String base64Image = null;
        if (image != null && !image.isEmpty()) {
            base64Image = "data:" + image.getContentType() + ";base64," +
                    Base64.getEncoder().encodeToString(image.getBytes());
        }
        Produit createdProduit = produitService.createProduit(produit, projetId, base64Image);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduit);
    }

    @GetMapping("/GetAllprod")
    public ResponseEntity<List<Produit>> getAllProduits() {
        List<Produit> produits = produitService.getAllProduits();
        return ResponseEntity.ok(produits);
    }

    @GetMapping("/GetProduitById/{id}")
    public ResponseEntity<Produit> getProduitById(@PathVariable Long id) {
        Optional<Produit> produit = produitService.getProduitById(id);
        return produit.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/UpdateProd/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Produit> updateProduit(
            @PathVariable Long id,
            @RequestPart(name = "produit") String produitJson,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        Produit produitDetails = objectMapper.readValue(produitJson, Produit.class);

        String base64Image = null;
        if (image != null && !image.isEmpty()) {
            base64Image = "data:" + image.getContentType() + ";base64," +
                    Base64.getEncoder().encodeToString(image.getBytes());
        }
        Produit updatedProduit = produitService.updateProduit(id, produitDetails, base64Image);
        return ResponseEntity.ok(updatedProduit);
    }

    @DeleteMapping("/DeleteProd/{id}")
    public ResponseEntity<Void> deleteProduit(@PathVariable Long id) {
        produitService.deleteProduit(id);
        return ResponseEntity.noContent().build();
    }
}