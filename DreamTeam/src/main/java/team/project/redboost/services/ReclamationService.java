package team.project.redboost.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import team.project.redboost.entities.Reclamation;
import team.project.redboost.entities.StatutReclamation;
import team.project.redboost.repositories.ReclamationRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ReclamationService {

    @Autowired
    private ReclamationRepository reclamationRepository;

    // Récupérer toutes les réclamations
    public List<Reclamation> getAllReclamations() {
        return reclamationRepository.findAll();
    }

    // Récupérer une réclamation par son ID
    public Reclamation getReclamationById(Long id) {
        return reclamationRepository.findById(id).orElse(null);
    }

    // Créer une nouvelle réclamation
    public Reclamation createReclamation(Reclamation reclamation) {
        reclamation.setIdUtilisateur(1L); // ID utilisateur fixe à 1
        if (reclamation.getReponses() != null) {
            reclamation.getReponses().forEach(reponse -> reponse.setReclamation(reclamation));
        }
        return reclamationRepository.save(reclamation);
    }

    // Mettre à jour une réclamation
    public Reclamation updateReclamation(Long id, Reclamation reclamationDetails) {
        Reclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réclamation non trouvée"));

        reclamation.setNom(reclamationDetails.getNom());
        reclamation.setEmail(reclamationDetails.getEmail());
        reclamation.setSujet(reclamationDetails.getSujet());
        reclamation.setDescription(reclamationDetails.getDescription());
        reclamation.setCategorie(reclamationDetails.getCategorie());
        reclamation.setStatut(reclamationDetails.getStatut());
        reclamation.setDate(reclamationDetails.getDate());

        // Mise à jour des réponses
        reclamation.getReponses().clear();
        if (reclamationDetails.getReponses() != null) {
            reclamationDetails.getReponses().forEach(reponse -> reponse.setReclamation(reclamation));
            reclamation.getReponses().addAll(reclamationDetails.getReponses());
        }

        return reclamationRepository.save(reclamation);
    }

    // Supprimer une réclamation
    public boolean deleteReclamation(Long id) {
        if (reclamationRepository.existsById(id)) {
            reclamationRepository.deleteById(id);
            return true;
        }
        return false;
    }
    public Reclamation updateReclamationStatut(Long idReclamation, StatutReclamation nouveauStatut) {
        Optional<Reclamation> reclamationOpt = reclamationRepository.findById(idReclamation);

        if (reclamationOpt.isPresent()) {
            Reclamation reclamation = reclamationOpt.get();
            reclamation.setStatut(nouveauStatut);
            return reclamationRepository.save(reclamation);
        }

        return null;
    }
}
