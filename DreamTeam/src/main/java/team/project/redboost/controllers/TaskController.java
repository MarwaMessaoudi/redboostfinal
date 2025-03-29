package team.project.redboost.controllers;

import team.project.redboost.entities.Task;
import team.project.redboost.entities.Comment;
import team.project.redboost.services.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:4200")
public class TaskController {
    @Autowired
    private TaskService taskService;

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        return taskService.createTask(task);
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

    @GetMapping("/{taskId}/attachments/{fileName}")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long taskId,
            @PathVariable String fileName) {
        try {
            Task task = taskService.getTaskById(taskId);
            if (task.getAttachments() == null || !task.getAttachments().contains(fileName)) {
                return ResponseEntity.notFound().build();
            }

            String uploadDir = "uploads/";
            Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/{taskId}/comments")
    public Task addCommentToTask(@PathVariable Long taskId, @RequestBody Comment comment) {
        return taskService.addCommentToTask(taskId, comment);
    }
}