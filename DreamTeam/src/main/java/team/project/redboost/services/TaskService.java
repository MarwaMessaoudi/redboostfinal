package team.project.redboost.services;

import team.project.redboost.entities.Task;
import team.project.redboost.entities.Phase;
import team.project.redboost.repositories.TaskRepository;
import team.project.redboost.repositories.PhaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class TaskService {

    private static final Logger logger = LoggerFactory.getLogger(TaskService.class);

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private PhaseRepository phaseRepository;

    // Create a new task
    public Task createTask(Task task) {
        if (task.getPhase() == null || task.getPhase().getPhaseId() == null) {
            throw new RuntimeException("Phase ID is required for task creation");
        }

        Phase phase = phaseRepository.findById(task.getPhase().getPhaseId())
                .orElseThrow(() -> new RuntimeException("Phase not found"));

        task.setPhase(phase);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        Task savedTask = taskRepository.save(task);
        updatePhaseTotalXpPoints(phase);

        logger.info("Creating task: {}", task);
        return savedTask;
    }

    // Get all tasks
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // Get a task by ID
    public Task getTaskById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    // Update a task
    public Task updateTask(Long taskId, Task updatedTask) {
        logger.info("Received updatedTask: {}", updatedTask);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setTitle(updatedTask.getTitle());
        task.setXpPoint(updatedTask.getXpPoint());
        task.setDescription(updatedTask.getDescription());
        task.setComments(updatedTask.getComments());
        task.setAssigneeId(updatedTask.getAssigneeId());
        task.setStartDate(updatedTask.getStartDate());
        task.setEndDate(updatedTask.getEndDate());
        task.setPriority(updatedTask.getPriority());
        task.setStatus(updatedTask.getStatus());
        task.setAttachments(updatedTask.getAttachments()); // Explicitly set the attachments

        // Check if the phase exists before updating
        if (updatedTask.getPhase() != null && updatedTask.getPhase().getPhaseId() != null) {
            Phase phase = phaseRepository.findById(updatedTask.getPhase().getPhaseId())
                    .orElseThrow(() -> new RuntimeException("Phase not found"));
            task.setPhase(phase);
        }

        task.setUpdatedAt(LocalDateTime.now());
        Task savedTask = taskRepository.save(task);
        updatePhaseTotalXpPoints(task.getPhase());

        logger.info("Updating task: {}", task);
        return savedTask;
    }

    // Delete a task
    public void deleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        taskRepository.deleteById(taskId);
        updatePhaseTotalXpPoints(task.getPhase());

        logger.info("Deleting task: {}", task);
    }

    // Get tasks by phase ID
    public List<Task> getTasksByPhaseId(Long phaseId) {
        return taskRepository.findByPhase_PhaseId(phaseId);
    }

    // Update the total XP points in the phase
    private void updatePhaseTotalXpPoints(Phase phase) {
        int totalXpPoints = phase.getTasks().stream().mapToInt(Task::getXpPoint).sum();
        phase.setTotalXpPoints(totalXpPoints);
        phaseRepository.save(phase);
    }
}