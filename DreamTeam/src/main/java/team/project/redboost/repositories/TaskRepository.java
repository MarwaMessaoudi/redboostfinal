package team.project.redboost.repositories;

import team.project.redboost.entities.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByPhase_PhaseId(Long phaseId); // Fetch tasks by phase ID
}