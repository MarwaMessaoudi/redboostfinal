package team.project.redboost.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import team.project.redboost.entities.Task;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    // Query tasks by phase ID
    List<Task> findByPhase_PhaseId(Long phaseId);

    // Query tasks by taskCategory's id (corrected method name)
    List<Task> findByTaskCategory_Id(Long taskCategoryId);
}