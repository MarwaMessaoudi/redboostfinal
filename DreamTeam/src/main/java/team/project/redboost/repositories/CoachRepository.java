package team.project.redboost.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import team.project.redboost.entities.Coach;

public interface CoachRepository extends JpaRepository<Coach, Long> {
}
