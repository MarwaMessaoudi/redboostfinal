package team.project.redboost.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team.project.redboost.entities.TaskCategory;
import team.project.redboost.services.TaskCategoryService;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/task-categories")
public class TaskCategoryController {
    private final TaskCategoryService taskCategoryService;

    public TaskCategoryController(TaskCategoryService taskCategoryService) {
        this.taskCategoryService = taskCategoryService;
    }

    // Create a new TaskCategory
    @PostMapping
    public ResponseEntity<TaskCategory> createTaskCategory(@RequestBody TaskCategory taskCategory) {
        TaskCategory savedCategory = taskCategoryService.createTaskCategory(taskCategory);
        return ResponseEntity.ok(savedCategory);
    }

    // Get all TaskCategories
    @GetMapping
    public ResponseEntity<List<TaskCategory>> getAllTaskCategories() {
        return ResponseEntity.ok(taskCategoryService.getAllTaskCategories());
    }

    // Get a single TaskCategory by ID
    @GetMapping("/{id}")
    public ResponseEntity<TaskCategory> getTaskCategoryById(@PathVariable Long id) {
        Optional<TaskCategory> category = taskCategoryService.getTaskCategoryById(id);
        return category.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Update a TaskCategory
    @PutMapping("/{id}")
    public ResponseEntity<TaskCategory> updateTaskCategory(@PathVariable Long id, @RequestBody TaskCategory updatedTaskCategory) {
        try {
            return ResponseEntity.ok(taskCategoryService.updateTaskCategory(id, updatedTaskCategory));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a TaskCategory
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTaskCategory(@PathVariable Long id) {
        taskCategoryService.deleteTaskCategory(id);
        return ResponseEntity.noContent().build();
    }
}
