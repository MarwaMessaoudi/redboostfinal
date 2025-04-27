package team.project.redboost.services;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import team.project.redboost.entities.Produit;
import team.project.redboost.entities.Projet;
import team.project.redboost.repositories.ProduitRepository;
import team.project.redboost.repositories.ProjetRepository;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class ProduitService {

    @Autowired
    private ProduitRepository produitRepository;

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Transactional
    public Produit createProduit(Produit produit, Long projetId, MultipartFile image) throws IOException {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet not found with id: " + projetId));

        if (image != null && !image.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(image);
            produit.setImage(imageUrl);
        }

        projet.getProduits().add(produit);
        projetRepository.save(projet);
        return produit;
    }

    public List<Produit> getAllProduits() {
        return produitRepository.findAll();
    }

    public Optional<Produit> getProduitById(Long id) {
        return produitRepository.findById(id);
    }

    public List<Produit> getProduitsByProjetId(Long projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet not found with id: " + projetId));
        return projet.getProduits();
    }

    @Transactional
    public Produit updateProduit(Long id, Produit produitDetails, MultipartFile image) throws IOException {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit not found with id: " + id));

        produit.setName(produitDetails.getName());
        produit.setDescription(produitDetails.getDescription());
        produit.setPrice(produitDetails.getPrice());
        produit.setStock(produitDetails.getStock());
        produit.setVentes(produitDetails.getVentes());
        produit.setPoids(produitDetails.getPoids());
        produit.setCategorie(produitDetails.getCategorie());
        produit.setDateExpiration(produitDetails.getDateExpiration());

        if (image != null && !image.isEmpty()) {
            // Delete old image if exists
            if (produit.getImage() != null) {
                String publicId = extractPublicIdFromUrl(produit.getImage());
                if (publicId != null) {
                    cloudinaryService.deleteImage(publicId);
                }
            }
            // Upload new image
            String imageUrl = cloudinaryService.uploadImage(image);
            produit.setImage(imageUrl);
        }

        return produitRepository.save(produit);
    }

    @Transactional
    public void deleteProduit(Long id) throws IOException {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit not found with id: " + id));

        if (produit.getImage() != null) {
            String publicId = extractPublicIdFromUrl(produit.getImage());
            if (publicId != null) {
                cloudinaryService.deleteImage(publicId);
            }
        }

        produitRepository.deleteById(id);
    }

    private String extractPublicIdFromUrl(String imageUrl) {
        if (imageUrl == null) return null;
        try {
            // Extract public ID from Cloudinary URL
            // Example: http://res.cloudinary.com/dfsd9mfbs/image/upload/v1234567890/sample.jpg
            String[] parts = imageUrl.split("/");
            String fileName = parts[parts.length - 1];
            return fileName.substring(0, fileName.lastIndexOf("."));
        } catch (Exception e) {
            return null;
        }
    }
}