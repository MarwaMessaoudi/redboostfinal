package team.project.redboost.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import team.project.redboost.entities.RendezVous;
import team.project.redboost.entities.Coach;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RendezVousRepository extends JpaRepository<RendezVous, Long> {
    List<RendezVous> findByCoach(Coach coach); // Query by the Coach entity
    List<RendezVous> findByDateAndStatus(LocalDate date, RendezVous.Status status);
    List<RendezVous> findByCoachId(Long coachId);
    List<RendezVous> findByEntrepreneurId(Long entrepreneurId);

}