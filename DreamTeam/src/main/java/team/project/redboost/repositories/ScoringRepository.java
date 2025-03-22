package team.project.redboost.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import team.project.redboost.entities.Scoring;

import java.util.Optional;

@Repository
public interface ScoringRepository extends JpaRepository<Scoring, Long> {

    // Méthode pour récupérer le scoring de l'utilisateur avec ID = 1
    Optional<Scoring> findById(Long id);

}
