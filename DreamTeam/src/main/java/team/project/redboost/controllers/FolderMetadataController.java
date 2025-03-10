package team.project.redboost.controllers;

import team.project.redboost.dtos.CreateFolderRequest;
import team.project.redboost.entities.Category;
import team.project.redboost.entities.FolderMetadata;
import team.project.redboost.services.CategoryService;
import team.project.redboost.services.FolderMetadataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/folders")
public class FolderMetadataController {

    private final FolderMetadataService folderMetadataService;
    private final CategoryService categoryService;

    @Autowired
    public FolderMetadataController(FolderMetadataService folderMetadataService, CategoryService categoryService) {
        this.folderMetadataService = folderMetadataService;
        this.categoryService = categoryService;
    }

    @PostMapping
    public ResponseEntity<FolderMetadata> createFolderMetadata(@RequestBody CreateFolderRequest request) {
        System.out.println("Received CreateFolderRequest: " + request); // Logging

        FolderMetadata folderMetadata = new FolderMetadata();
        folderMetadata.setFolderName(request.getFolderName());
        folderMetadata.setFolderPath(request.getFolderPath()); // Optional. You can generate it in backend.

        if (request.getCategoryId() == null && request.getParentFolderId() == null) {  //Problem!
            System.out.println("CategoryId and ParentFolderId are null!");
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Category category = null;
        if(request.getCategoryId() != null) {
            try {
                category = categoryService.getCategoryById(request.getCategoryId());
            } catch (NoSuchElementException e) {
                System.out.println("Category not found with id: " + request.getCategoryId());
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // Or a more specific error
            }

            folderMetadata.setCategory(category); // Only set the category if it was found
        }



        FolderMetadata createdFolderMetadata = folderMetadataService.createFolderMetadata(folderMetadata);
        return new ResponseEntity<>(createdFolderMetadata, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FolderMetadata> getFolderMetadataById(@PathVariable Long id) {
        try {
            FolderMetadata folderMetadata = folderMetadataService.getFolderMetadataById(id);
            return new ResponseEntity<>(folderMetadata, HttpStatus.OK);
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/path")
    public ResponseEntity<FolderMetadata> getFolderMetadataByPath(@RequestParam String folderPath) {
        try {
            FolderMetadata folderMetadata = folderMetadataService.getFolderMetadataByPath(folderPath);
            return new ResponseEntity<>(folderMetadata, HttpStatus.OK);
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping
    public ResponseEntity<List<FolderMetadata>> getAllFolderMetadata() {
        List<FolderMetadata> folderMetadataList = folderMetadataService.getAllFolderMetadata();
        return new ResponseEntity<>(folderMetadataList, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FolderMetadata> updateFolderMetadata(@PathVariable Long id, @RequestBody FolderMetadata folderMetadataDetails) {
        try {
            FolderMetadata existingFolderMetadata = folderMetadataService.getFolderMetadataById(id);

            if (existingFolderMetadata == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            Category category = null;
            if(folderMetadataDetails.getCategory() != null) {
                try {
                    category = categoryService.getCategoryById(folderMetadataDetails.getCategory().getId());
                } catch (NoSuchElementException e) {
                    System.out.println("Category not found with id: " + folderMetadataDetails.getCategory().getId());
                    return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // Or a more specific error
                }

                existingFolderMetadata.setCategory(category); // Only set the category if it was found
            }

            // Update folder name and path
            existingFolderMetadata.setFolderName(folderMetadataDetails.getFolderName());
            existingFolderMetadata.setFolderPath(folderMetadataDetails.getFolderPath());

            FolderMetadata updatedFolderMetadata = folderMetadataService.updateFolderMetadata(id, existingFolderMetadata);
            return new ResponseEntity<>(updatedFolderMetadata, HttpStatus.OK);
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFolderMetadata(@PathVariable Long id) {
        try {
            folderMetadataService.deleteFolderMetadata(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}