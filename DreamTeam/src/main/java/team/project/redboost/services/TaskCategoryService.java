package team.project.redboost.services;

import org.springframework.stereotype.Service;
import team.project.redboost.entities.TaskCategory;
import team.project.redboost.repositories.TaskCategoryRepository;
import java.util.List;
import java.util.Optional;

@Service
public class TaskCategoryService {
    private final TaskCategoryRepository taskCategoryRepository;

    public TaskCategoryService(TaskCategoryRepository taskCategoryRepository) {
        this.taskCategoryRepository = taskCategoryRepository;
    }

    // Create a new TaskCategory
    public TaskCategory createTaskCategory(TaskCategory taskCategory) {
        return taskCategoryRepository.save(taskCategory);
    }

    // Get all TaskCategories
    public List<TaskCategory> getAllTaskCategories() {
        return taskCategoryRepository.findAll();
    }

    // Get a single TaskCategory by ID
    public Optional<TaskCategory> getTaskCategoryById(Long id) {
        return taskCategoryRepository.findById(id);
    }

    // Update a TaskCategory
    public TaskCategory updateTaskCategory(Long id, TaskCategory updatedTaskCategory) {
        return taskCategoryRepository.findById(id).map(existingCategory -> {
            existingCategory.setName(updatedTaskCategory.getName());
            return taskCategoryRepository.save(existingCategory);
        }).orElseThrow(() -> new RuntimeException("TaskCategory not found with ID: " + id));
    }

    // Delete a TaskCategory
    public void deleteTaskCategory(Long id) {
        taskCategoryRepository.deleteById(id);
    }
}
