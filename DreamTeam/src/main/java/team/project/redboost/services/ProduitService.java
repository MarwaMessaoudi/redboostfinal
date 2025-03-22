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

    // Ajouter un produit et l'associer à un Projet
    @Transactional
    public Produit createProduit(Produit produit, Long projetId) {
        // Fetch the Projet by ID
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new RuntimeException("Projet not found with id: " + projetId));

        // Save the Produit first (if it doesn't have an ID)
        Produit savedProduit = produitRepository.save(produit);

        // Add the Produit to the Projet's produits list
        projet.getProduits().add(savedProduit);

        // Save the Projet (this will update the foreign key in the Produit table)
        projetRepository.save(projet);

        return savedProduit;
    }

    // Récupérer tous les produits
    public List<Produit> getAllProduits() {
        return produitRepository.findAll();
    }

    // Récupérer un produit par ID
    public Optional<Produit> getProduitById(Long id) {
        return produitRepository.findById(id);
    }

    // Mettre à jour un produit
    @Transactional
    public Produit updateProduit(Long id, Produit produitDetails) {
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
        produit.setImage(produitDetails.getImage());

        return produitRepository.save(produit);
    }

    // Supprimer un produit
    @Transactional
    public void deleteProduit(Long id) {
        produitRepository.deleteById(id);
    }
}