package team.project.redboost.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import team.project.redboost.entities.Task;
import team.project.redboost.entities.Phase;
import team.project.redboost.entities.Projet;
import team.project.redboost.entities.TaskCategory;
import team.project.redboost.entities.SubTask;
import team.project.redboost.entities.Comment;
import team.project.redboost.repositories.TaskRepository;
import team.project.redboost.repositories.PhaseRepository;
import team.project.redboost.repositories.ProjetRepository;
import team.project.redboost.repositories.TaskCategoryRepository;
import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class TaskService {
    private static final Logger logger = LoggerFactory.getLogger(TaskService.class);

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private PhaseRepository phaseRepository;

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private TaskCategoryRepository taskCategoryRepository;

    @Autowired
    private GoogleDriveService googleDriveService;

    public Task createTask(Task task, MultipartFile attachment) {
        if (task.getPhase() == null || task.getPhase().getPhaseId() == null) {
            throw new IllegalArgumentException("Phase ID is required for task creation");
        }

        Phase phase = phaseRepository.findByIdWithProjet(task.getPhase().getPhaseId())
                .orElseThrow(() -> new IllegalArgumentException("Phase not found with ID: " + task.getPhase().getPhaseId()));

        task.setPhase(phase);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        if (task.getTaskCategory() != null && task.getTaskCategory().getId() != null) {
            TaskCategory category = taskCategoryRepository.findById(task.getTaskCategory().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + task.getTaskCategory().getId()));
            task.setTaskCategory(category);
        }

        if (task.getSubTasks() != null) {
            for (SubTask subTask : task.getSubTasks()) {
                task.addSubTask(subTask);
            }
        }

        if (attachment != null && !attachment.isEmpty()) {
            try {
                Projet projet = phase.getProjet();
                if (projet == null) {
                    projet = projetRepository.findProjetByPhase(phase)
                            .orElseThrow(() -> new IllegalArgumentException("Project not found for phase ID: " + phase.getPhaseId()));
                }

                String projectFolderId = projet.getDriveFolderId();
                if (projectFolderId == null) {
                    throw new IllegalArgumentException("Project folder ID not found for project ID: " + projet.getId());
                }

                List<Map<String, String>> subFolders = googleDriveService.getSubFoldersList(projectFolderId);
                String accompagnementFolderId = subFolders.stream()
                        .filter(folder -> "Accompagnement".equals(folder.get("name")))
                        .findFirst()
                        .map(folder -> folder.get("id"))
                        .orElseGet(() -> {
                            try {
                                return googleDriveService.createSubFolder("Accompagnement", projectFolderId);
                            } catch (IOException e) {
                                throw new RuntimeException("Failed to create Accompagnement folder", e);
                            }
                        });

                String fileName = attachment.getOriginalFilename() != null ? attachment.getOriginalFilename() : "unnamed_file";
                String mimeType = attachment.getContentType() != null ? attachment.getContentType() : "application/octet-stream";
                String fileId = googleDriveService.uploadFile(accompagnementFolderId, fileName, attachment.getInputStream(), mimeType);

                task.setAttachment(fileId);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload attachment to Google Drive", e);
            }
        }

        Task savedTask = taskRepository.save(task);
        updatePhaseTotalXpPoints(phase);

        logger.info("Created task: {}", task);
        return savedTask;
    }

    public List<Task> getAllTasks() {
        List<Task> tasks = taskRepository.findAll();
        tasks.forEach(task -> {
            Hibernate.initialize(task.getSubTasks());
            Hibernate.initialize(task.getComments());
        });
        return tasks;
    }

    public Task getTaskById(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + taskId));
        Hibernate.initialize(task.getSubTasks());
        Hibernate.initialize(task.getComments());
        return task;
    }

    public Task updateTask(Long taskId, Task updatedTask) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + taskId));

        if (task.getStatus() == Task.Status.VALIDATED) {
            throw new IllegalStateException("Cannot update a validated task");
        }

        task.setTitle(updatedTask.getTitle());
        task.setXpPoint(updatedTask.getXpPoint());
        task.setDescription(updatedTask.getDescription());
        task.setAssigneeId(updatedTask.getAssigneeId());
        task.setStartDate(updatedTask.getStartDate());
        task.setEndDate(updatedTask.getEndDate());
        task.setPriority(updatedTask.getPriority());
        task.setStatus(updatedTask.getStatus());
        task.setAttachment(updatedTask.getAttachment());

        if (updatedTask.getPhase() != null && updatedTask.getPhase().getPhaseId() != null) {
            Phase phase = phaseRepository.findById(updatedTask.getPhase().getPhaseId())
                    .orElseThrow(() -> new IllegalArgumentException("Phase not found with ID: " + updatedTask.getPhase().getPhaseId()));
            task.setPhase(phase);
        }

        if (updatedTask.getTaskCategory() != null && updatedTask.getTaskCategory().getId() != null) {
            TaskCategory category = taskCategoryRepository.findById(updatedTask.getTaskCategory().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + updatedTask.getTaskCategory().getId()));
            task.setTaskCategory(category);
        }

        if (updatedTask.getSubTasks() != null) {
            task.getSubTasks().clear();
            for (SubTask subTask : updatedTask.getSubTasks()) {
                task.addSubTask(subTask);
            }
        }

        if (updatedTask.getComments() != null) {
            task.getComments().clear();
            for (Comment comment : updatedTask.getComments()) {
                task.addComment(comment);
            }
        }

        task.setUpdatedAt(LocalDateTime.now());
        Task savedTask = taskRepository.save(task);
        updatePhaseTotalXpPoints(task.getPhase());

        logger.info("Updated task: {}", task);
        return savedTask;
    }

    public void deleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + taskId));

        taskRepository.deleteById(taskId);
        updatePhaseTotalXpPoints(task.getPhase());

        logger.info("Deleted task: {}", task);
    }

    public List<Task> getTasksByPhaseId(Long phaseId) {
        List<Task> tasks = taskRepository.findByPhase_PhaseId(phaseId);
        tasks.forEach(task -> {
            Hibernate.initialize(task.getTaskCategory());
            Hibernate.initialize(task.getSubTasks());
            Hibernate.initialize(task.getComments());
        });
        return tasks;
    }

    public List<Task> getTasksByCategoryId(Long categoryId) {
        List<Task> tasks = taskRepository.findByTaskCategory_Id(categoryId);
        tasks.forEach(task -> {
            Hibernate.initialize(task.getTaskCategory());
            Hibernate.initialize(task.getSubTasks());
            Hibernate.initialize(task.getComments());
        });
        return tasks;
    }

    public Task addCommentToTask(Long taskId, Comment comment) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + taskId));

        task.addComment(comment);
        task.setUpdatedAt(LocalDateTime.now());

        Task savedTask = taskRepository.save(task);
        logger.info("Added comment to task: {}", task);
        return savedTask;
    }

    public Task validateTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + taskId));

        if (task.getStatus() != Task.Status.DONE) {
            throw new IllegalStateException("Only tasks in DONE status can be validated");
        }

        task.setStatus(Task.Status.VALIDATED);
        task.setUpdatedAt(LocalDateTime.now());

        Task savedTask = taskRepository.save(task);
        updatePhaseTotalXpPoints(task.getPhase());
        updatePhaseStatus(task.getPhase());

        logger.info("Validated task: {}", task);
        return savedTask;
    }

    public Task rejectTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + taskId));

        if (task.getStatus() != Task.Status.DONE) {
            throw new IllegalStateException("Only tasks in DONE status can be rejected");
        }

        task.setStatus(Task.Status.TO_DO);
        task.setUpdatedAt(LocalDateTime.now());

        Task savedTask = taskRepository.save(task);
        updatePhaseTotalXpPoints(task.getPhase());
        updatePhaseStatus(task.getPhase());

        logger.info("Rejected task: {}", task);
        return savedTask;
    }

    private void updatePhaseTotalXpPoints(Phase phase) {
        if (phase != null) {
            Hibernate.initialize(phase.getTasks());
            int totalXpPoints = phase.getTasks().stream().mapToInt(Task::getXpPoint).sum();
            phase.setTotalXpPoints(totalXpPoints);
            phaseRepository.save(phase);
        }
    }

    private void updatePhaseStatus(Phase phase) {
        if (phase == null) return;

        List<Task> tasks = taskRepository.findByPhase_PhaseId(phase.getPhaseId());
        if (tasks.isEmpty()) {
            phase.setStatus(Phase.Status.NOT_STARTED);
        } else if (tasks.stream().allMatch(task -> task.getStatus() == Task.Status.VALIDATED)) {
            phase.setStatus(Phase.Status.COMPLETED);
        } else if (tasks.stream().anyMatch(
                task -> task.getStatus() == Task.Status.IN_PROGRESS ||
                        task.getStatus() == Task.Status.DONE ||
                        task.getStatus() == Task.Status.VALIDATED)) {
            phase.setStatus(Phase.Status.IN_PROGRESS);
        } else {
            phase.setStatus(Phase.Status.NOT_STARTED);
        }

        phaseRepository.save(phase);
        logger.info("Updated phase status for phase {} to {}", phase.getPhaseId(), phase.getStatus());
    }
}