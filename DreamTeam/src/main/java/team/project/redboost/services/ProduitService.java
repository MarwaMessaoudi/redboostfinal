package team.project.redboost.services;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import team.project.redboost.entities.Produit;
import team.project.redboost.entities.Projet;
import team.project.redboost.repositories.ProduitRepository;
import team.project.redboost.repositories.ProjetRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ProduitService {

    @Autowired
    private ProduitRepository produitRepository;

    @Autowired
    private ProjetRepository projetRepository;

    @Transactional
    public Produit createProduit(Produit produit, Long projetId, String base64Image) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet not found with id: " + projetId));
        produit.setImage(base64Image);
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

    @Transactional
    public Produit updateProduit(Long id, Produit produitDetails, String base64Image) {
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
        if (base64Image != null && !base64Image.isEmpty()) {
            produit.setImage(base64Image);
        }
        return produitRepository.save(produit);
    }

    @Transactional
    public void deleteProduit(Long id) {
        if (!produitRepository.existsById(id)) {
            throw new RuntimeException("Produit not found with id: " + id);
        }
        produitRepository.deleteById(id);
    }
}