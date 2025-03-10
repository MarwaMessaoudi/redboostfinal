package team.project.redboost.controllers;

import jakarta.validation.Valid;
import team.project.redboost.entities.Category;
import team.project.redboost.entities.CategoryWithoutRelationDTO;
import team.project.redboost.services.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper; // Import ObjectMapper
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    @Autowired
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryWithoutRelationDTO>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        List<CategoryWithoutRelationDTO> dtos = categories.stream()
                .map(x -> new CategoryWithoutRelationDTO(x.getId(), x.getCategoryName(), x.getDescription()))
                .collect(Collectors.toList());
        try {
            ObjectMapper mapper = new ObjectMapper();
            String json = mapper.writeValueAsString(dtos);
            System.out.println("JSON Response: " + json); // Log the JSON for debugging
            return new ResponseEntity<>(dtos, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@Valid @RequestBody Category category) { // Use @Valid
        Category createdCategory = categoryService.createCategory(category);
        return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
    }


}
