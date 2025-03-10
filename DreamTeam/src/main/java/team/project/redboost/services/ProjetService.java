package team.project.redboost.services;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import team.project.redboost.entities.Projet;
import team.project.redboost.repositories.ProjetRepository;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ProjetService {
    private final ProjetRepository projetRepository;

    public ProjetService(ProjetRepository projetRepository) {
        this.projetRepository = projetRepository;
    }

    public Projet createProjet(Projet projet, String imageUrl) {
        if (imageUrl != null && !imageUrl.isEmpty()) {
            projet.setLogoUrl(imageUrl);
        }
        if (projet.getGlobalScore() == null) projet.setGlobalScore(0.0);
        if (projet.getLastUpdated() == null) projet.setLastUpdated(LocalDate.now());
        if (projet.getLastEvaluationDate() == null) projet.setLastEvaluationDate(LocalDate.now());
        return projetRepository.save(projet);
    }

    public Projet updateProjet(Long id, Projet updatedProjet, String imageUrl) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Projet non trouvé avec l'ID : " + id));

        // Delete old logo file if a new one is provided
        if (imageUrl != null && !imageUrl.isEmpty() && projet.getLogoUrl() != null) {
            try {
                Files.deleteIfExists(Paths.get(projet.getLogoUrl().substring(1))); // Remove old file
            } catch (Exception e) {
                // Log the error if needed, but don’t fail the update
                System.err.println("Failed to delete old logo file: " + e.getMessage());
            }
        }

        projet.setName(updatedProjet.getName());
        projet.setDescription(updatedProjet.getDescription());
        if (imageUrl != null && !imageUrl.isEmpty()) {
            projet.setLogoUrl(imageUrl);
        }
        projet.setLastUpdated(LocalDate.now());
        return projetRepository.save(projet);
    }

    public List<Projet> getAllProjets() {
        return projetRepository.findAll();
    }

    public Projet getProjetById(Long id) {
        return projetRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Projet non trouvé avec l'ID : " + id));
    }

    @Transactional
    public void deleteProjet(Long id) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Projet non trouvé avec l'ID : " + id));

        // Delete logo file if it exists
        if (projet.getLogoUrl() != null) {
            try {
                Files.deleteIfExists(Paths.get(projet.getLogoUrl().substring(1)));
            } catch (Exception e) {
                System.err.println("Failed to delete logo file: " + e.getMessage());
            }
        }

        projetRepository.delete(projet);
    }

    public List<Object[]> getProjetCardByFounderId(String founderId) {
        return projetRepository.findProjetCardByFounderId(founderId);
    }
}