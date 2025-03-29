package team.project.redboost.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import team.project.redboost.entities.CoachRequest;
import team.project.redboost.entities.RequestStatus;

public interface CoachRequestRepository extends JpaRepository<CoachRequest, Long> {
    boolean existsByEmailAndStatus(String email, RequestStatus status);
}