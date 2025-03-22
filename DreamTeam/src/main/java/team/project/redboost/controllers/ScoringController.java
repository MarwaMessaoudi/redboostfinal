package team.project.redboost.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team.project.redboost.entities.Scoring;
import team.project.redboost.services.ScoringService;

@RestController
@RequestMapping("/api/scoring")
public class ScoringController {

    @Autowired
    private ScoringService scoringService;

    // Endpoint pour mettre à jour le score de l'utilisateur
    @PutMapping("/update/{scoreTotal}")
    public ResponseEntity<Scoring> updateScoring(@PathVariable int scoreTotal) {
        Scoring updatedScoring = scoringService.updateScoring(scoreTotal);
        return ResponseEntity.ok(updatedScoring);
    }

    // Endpoint pour récupérer le score actuel de l'utilisateur (id = 1)
    @GetMapping("/current")
    public ResponseEntity<Scoring> getCurrentScoring() {
        Scoring scoring = scoringService.getScoringByUtilisateurId();
        if (scoring == null) {
            return ResponseEntity.notFound().build();  // Si aucun scoring n'est trouvé
        }
        return ResponseEntity.ok(scoring);
    }
}
