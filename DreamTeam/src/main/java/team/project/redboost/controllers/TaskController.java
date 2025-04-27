package team.project.redboost.controllers;

import team.project.redboost.entities.Task;
import team.project.redboost.entities.Comment;
import team.project.redboost.services.GoogleDriveService;
import team.project.redboost.services.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:4200")
public class TaskController {
    private static final Logger logger = LoggerFactory.getLogger(TaskController.class);

    @Autowired
    private TaskService taskService;

    @Autowired
    private GoogleDriveService googleDriveService;

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<Task> createTask(
            @RequestPart("task") Task task,
            @RequestPart(value = "attachment", required = false) MultipartFile attachment) {
        try {
            Task createdTask = taskService.createTask(task, attachment);
            return ResponseEntity.ok(createdTask);
        } catch (Exception e) {
            logger.error("Failed to create task: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    @GetMapping("/{taskId}")
    public Task getTaskById(@PathVariable Long taskId) {
        return taskService.getTaskById(taskId);
    }

    @PutMapping("/{taskId}")
    public Task updateTask(@PathVariable Long taskId, @RequestBody Task updatedTask) {
        return taskService.updateTask(taskId, updatedTask);
    }

    @DeleteMapping("/{taskId}")
    public void deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
    }

    @GetMapping("/phase/{phaseId}")
    public List<Task> getTasksByPhaseId(@PathVariable Long phaseId) {
        return taskService.getTasksByPhaseId(phaseId);
    }

    @GetMapping("/category/{categoryId}")
    public List<Task> getTasksByCategoryId(@PathVariable Long categoryId) {
        return taskService.getTasksByCategoryId(categoryId);
    }

    @GetMapping("/{taskId}/attachment")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long taskId) {
        try {
            Task task = taskService.getTaskById(taskId);
            if (task.getAttachment() == null) {
                return ResponseEntity.notFound().build();
            }

            String fileId = task.getAttachment();
            InputStream fileStream = googleDriveService.downloadFile(fileId);
            String fileName = googleDriveService.getFileName(fileId);

            InputStreamResource resource = new InputStreamResource(fileStream);

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (IOException e) {
            logger.error("Failed to download attachment: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/{taskId}/comments")
    public Task addCommentToTask(@PathVariable Long taskId, @RequestBody Comment comment) {
        return taskService.addCommentToTask(taskId, comment);
    }

    @PostMapping("/{taskId}/validate")
    @PreAuthorize("hasRole('COACH')")
    public ResponseEntity<Task> validateTask(@PathVariable Long taskId) {
        try {
            Task validatedTask = taskService.validateTask(taskId);
            return ResponseEntity.ok(validatedTask);
        } catch (Exception e) {
            logger.error("Failed to validate task: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/{taskId}/reject")
    @PreAuthorize("hasRole('COACH')")
    public ResponseEntity<Task> rejectTask(@PathVariable Long taskId) {
        try {
            Task rejectedTask = taskService.rejectTask(taskId);
            return ResponseEntity.ok(rejectedTask);
        } catch (Exception e) {
            logger.error("Failed to reject task: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(null);
        }
    }
}