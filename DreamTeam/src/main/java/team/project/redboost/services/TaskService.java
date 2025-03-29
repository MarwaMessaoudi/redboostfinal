package team.project.redboost.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import team.project.redboost.entities.Task;
import team.project.redboost.entities.Phase;
import team.project.redboost.entities.TaskCategory;
import team.project.redboost.entities.SubTask;
import team.project.redboost.entities.Comment;
import team.project.redboost.repositories.TaskRepository;
import team.project.redboost.repositories.PhaseRepository;
import team.project.redboost.repositories.TaskCategoryRepository;
import org.hibernate.Hibernate;

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

    @Autowired
    private TaskCategoryRepository taskCategoryRepository;

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

        if (task.getTaskCategory() != null && task.getTaskCategory().getId() != null) {
            TaskCategory category = taskCategoryRepository.findById(task.getTaskCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            task.setTaskCategory(category);
        }

        if (task.getSubTasks() != null) {
            for (SubTask subTask : task.getSubTasks()) {
                task.addSubTask(subTask);
            }
        }

        Task savedTask = taskRepository.save(task);
        updatePhaseTotalXpPoints(phase);

        logger.info("Creating task: {}", task);
        return savedTask;
    }

    // Get all tasks
    public List<Task> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();
        tasks.forEach(task -> {
            Hibernate.initialize(task.getSubTasks());
            Hibernate.initialize(task.getComments());
        });
        return tasks;
    }

    // Get a task by ID
    public Task getTaskById(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        Hibernate.initialize(task.getSubTasks());
        Hibernate.initialize(task.getComments());
        return task;
    }

    // Update a task
    public Task updateTask(Long taskId, Task updatedTask) {
        logger.info("Received updatedTask: {}", updatedTask);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Update scalar fields
        task.setTitle(updatedTask.getTitle());
        task.setXpPoint(updatedTask.getXpPoint());
        task.setDescription(updatedTask.getDescription());
        task.setAssigneeId(updatedTask.getAssigneeId());
        task.setStartDate(updatedTask.getStartDate());
        task.setEndDate(updatedTask.getEndDate());
        task.setPriority(updatedTask.getPriority());
        task.setStatus(updatedTask.getStatus());
        task.setAttachments(updatedTask.getAttachments());

        // Update phase
        if (updatedTask.getPhase() != null && updatedTask.getPhase().getPhaseId() != null) {
            Phase phase = phaseRepository.findById(updatedTask.getPhase().getPhaseId())
                    .orElseThrow(() -> new RuntimeException("Phase not found"));
            task.setPhase(phase);
        }

        // Update task category
        if (updatedTask.getTaskCategory() != null && updatedTask.getTaskCategory().getId() != null) {
            TaskCategory category = taskCategoryRepository.findById(updatedTask.getTaskCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            task.setTaskCategory(category);
        }

        // Update sub-tasks
        if (updatedTask.getSubTasks() != null) {
            task.getSubTasks().clear();
            for (SubTask subTask : updatedTask.getSubTasks()) {
                task.addSubTask(subTask);
            }
        }

        // Update comments
        if (updatedTask.getComments() != null) {
            task.getComments().clear(); // Clear existing comments
            for (Comment comment : updatedTask.getComments()) {
                task.addComment(comment); // Add new/updated comments
            }
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
        List<Task> tasks = taskRepository.findByPhase_PhaseId(phaseId);
        tasks.forEach(task -> {
            Hibernate.initialize(task.getTaskCategory());
            Hibernate.initialize(task.getSubTasks());
            Hibernate.initialize(task.getComments());
        });
        return tasks;
    }

    // Get tasks by category ID
    public List<Task> getTasksByCategoryId(Long categoryId) {
        List<Task> tasks = taskRepository.findByTaskCategory_Id(categoryId);
        tasks.forEach(task -> {
            Hibernate.initialize(task.getTaskCategory());
            Hibernate.initialize(task.getSubTasks());
            Hibernate.initialize(task.getComments());
        });
        return tasks;
    }

    // Add a comment to a task
    public Task addCommentToTask(Long taskId, Comment comment) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.addComment(comment);
        task.setUpdatedAt(LocalDateTime.now());

        Task savedTask = taskRepository.save(task);
        logger.info("Added comment to task: {}", task);
        return savedTask;
    }

    // Update the total XP points in the phase
    private void updatePhaseTotalXpPoints(Phase phase) {
        if (phase != null) {
            Hibernate.initialize(phase.getTasks());
            int totalXpPoints = phase.getTasks().stream().mapToInt(Task::getXpPoint).sum();
            phase.setTotalXpPoints(totalXpPoints);
            phaseRepository.save(phase);
        }
    }
}