package team.project.redboost.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import team.project.redboost.entities.Reclamation;
import team.project.redboost.entities.ReponseReclamation;
import team.project.redboost.entities.ReponseReclamation.SenderType;
import team.project.redboost.repositories.ReclamationRepository;
import team.project.redboost.repositories.ReponseReclamationRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReponseReclamationService {

    private final ReponseReclamationRepository reponseRepository;
    private final ReclamationRepository reclamationRepository;

    public List<ReponseReclamation> getReponsesByReclamation(Long idReclamation) {
        // Utiliser findByReclamationId puis trier les résultats
        List<ReponseReclamation> reponses = reponseRepository.findByReclamationId(idReclamation);
        reponses.sort((r1, r2) -> r1.getDateCreation().compareTo(r2.getDateCreation()));
        return reponses;

        // Alternative avec un Sort
        // return reponseRepository.findByReclamationId(idReclamation, Sort.by(Sort.Direction.ASC, "dateCreation"));
    }

    // Créer une nouvelle réponse
    public ReponseReclamation createReponse(Long idReclamation, ReponseReclamation reponse) {
        Optional<Reclamation> reclamationOpt = reclamationRepository.findById(idReclamation);

        if (reclamationOpt.isPresent()) {
            reponse.setReclamation(reclamationOpt.get());
            reponse.setDateCreation(LocalDateTime.now());

            // Assurer que le sender est défini correctement
            if (reponse.getSender() == null) {
                // Logique par défaut si nécessaire
                reponse.setSender(SenderType.USER);
            }

            return reponseRepository.save(reponse);
        }

        return null;
    }

    // Méthode spécifique pour créer une réponse d'admin
    public ReponseReclamation createAdminReponse(Long idReclamation, ReponseReclamation reponse, Long adminId) {
        reponse.setSender(SenderType.ADMIN);
        reponse.setUserId(adminId);
        return createReponse(idReclamation, reponse);
    }

    // Méthode spécifique pour créer une réponse d'utilisateur
    public ReponseReclamation createUserReponse(Long idReclamation, ReponseReclamation reponse, Long userId) {
        reponse.setSender(SenderType.USER);
        reponse.setUserId(userId);
        return createReponse(idReclamation, reponse);
    }

    // Mettre à jour une réponse
    public ReponseReclamation updateReponse(Long idReponse, ReponseReclamation updatedReponse) {
        Optional<ReponseReclamation> existingOpt = reponseRepository.findById(idReponse);

        if (existingOpt.isPresent()) {
            ReponseReclamation existing = existingOpt.get();
            existing.setContenu(updatedReponse.getContenu());
            // Ne pas modifier sender, reclamation, ou userId lors d'une mise à jour

            return reponseRepository.save(existing);
        }

        return null;
    }

    // Supprimer une réponse
    public boolean deleteReponse(Long idReponse) {
        if (reponseRepository.existsById(idReponse)) {
            reponseRepository.deleteById(idReponse);
            return true;
        }
        return false;
    }


}