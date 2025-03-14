package team.project.redboost.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import team.project.redboost.entities.Reclamation;
import team.project.redboost.entities.ReponseReclamation;
import team.project.redboost.entities.ReponseReclamation.SenderType;
import team.project.redboost.entities.User;
import team.project.redboost.repositories.ReclamationRepository;
import team.project.redboost.repositories.ReponseReclamationRepository;
import team.project.redboost.repositories.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReponseReclamationService {

    private final ReponseReclamationRepository reponseRepository;
    private final ReclamationRepository reclamationRepository;
    private final UserRepository userRepository;

    public List<ReponseReclamation> getReponsesByReclamation(Long idReclamation) {
        // Utiliser findByReclamationId puis trier les résultats
        List<ReponseReclamation> reponses = reponseRepository.findByReclamationId(idReclamation);
        reponses.sort((r1, r2) -> r1.getDateCreation().compareTo(r2.getDateCreation()));
        return reponses;

        // Alternative avec un Sort
        // return reponseRepository.findByReclamationId(idReclamation, Sort.by(Sort.Direction.ASC, "dateCreation"));
    }

    public ReponseReclamation createUserReponse(Long idReclamation, String content, User user) {
        //Recieve String content
        ReponseReclamation reponse = new ReponseReclamation(); //Create the DTO
        reponse.setContenu(content); //Put the content, and now it is handled
        reponse.setUser(user);  // Set the User entity
        reponse.setDateCreation(LocalDateTime.now());

        // Assurer que le sender est défini correctement
        if (reponse.getSender() == null) {
            // Logique par défaut si nécessaire
            reponse.setSender(SenderType.USER);
        }

        return reponseRepository.save(reponse);

    }
    public ReponseReclamation createAdminReponse(Long idReclamation, String content, User user) {
        //Recieve String content
        ReponseReclamation reponse = new ReponseReclamation(); //Create the DTO
        reponse.setContenu(content); //Put the content, and now it is handled
        reponse.setUser(user);  // Set the User entity
        reponse.setDateCreation(LocalDateTime.now());
        reponse.setSender(SenderType.ADMIN);

        // Assurer que le sender est défini correctement


        return reponseRepository.save(reponse);

    }

    // Mettre à jour une réponse
    public ReponseReclamation updateReponse(Long idReponse, ReponseReclamation updatedReponse) {
        Optional<ReponseReclamation> existingOpt = reponseRepository.findById(idReponse);

        if (existingOpt.isPresent()) {
            ReponseReclamation existing = existingOpt.get();
            existing.setContenu(updatedReponse.getContenu());
            // Ne pas modifier sender, reclamation, ou userId lors d'une mise à jour
            //existing.setUser(updatedReponse.getUser()); //Do not modify

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