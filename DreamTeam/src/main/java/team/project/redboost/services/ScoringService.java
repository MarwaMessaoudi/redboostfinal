package team.project.redboost.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import team.project.redboost.entities.Niveau;
import team.project.redboost.entities.Scoring;
import team.project.redboost.repositories.ScoringRepository;

import java.time.LocalDateTime;

@Service
public class ScoringService {

    @Autowired
    private ScoringRepository scoringRepository;

    // Méthode pour mettre à jour le score d'un utilisateur
    public Scoring updateScoring(int scoreTotal) {
        Scoring scoring = scoringRepository.findById(1L)
                .orElse(new Scoring()); // Si l'utilisateur n'a pas de scoring, en crée un nouveau

        scoring.setScoreTotal(scoreTotal);
        scoring.setDateMiseAJour(LocalDateTime.now());

        // Calculer le niveau basé sur le score
        Niveau niveau = Niveau.getNiveauByScore(scoreTotal);
        scoring.setNiveau(niveau);

        // Définir les seuils pour le niveau
        scoring.setSeuilMinNiveau(niveau.getSeuilMin());
        scoring.setSeuilMaxNiveau(niveau.getSeuilMax());

        return scoringRepository.save(scoring);
    }

    // Méthode pour récupérer le score d'un utilisateur
    public Scoring getScoringByUtilisateurId() {
        return scoringRepository.findById(1L).orElse(null);  // Toujours chercher l'utilisateur avec ID = 1
    }
}
