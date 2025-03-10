package team.project.redboost.repositories;

import team.project.redboost.entities.Phase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface PhaseRepository extends JpaRepository<Phase, Long> {
    List<Phase> findByStartDateBetween(LocalDate start, LocalDate end); // Fetch phases within a date range
}