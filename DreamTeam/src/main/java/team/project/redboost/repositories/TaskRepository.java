package team.project.redboost.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import team.project.redboost.entities.Task;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByPhase_PhaseId(Long phaseId);
    List<Task> findByTaskCategory_Id(Long taskCategoryId);
}