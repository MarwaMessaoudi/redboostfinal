package team.project.redboost.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import team.project.redboost.entities.Entrepreneur;

public interface EntrepreneurRepository extends JpaRepository<Entrepreneur, Long> {
}
