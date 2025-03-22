package team.project.redboost.controllers;

import team.project.redboost.entities.SubFolder;
import team.project.redboost.services.SubFolderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team.project.redboost.entities.FolderMetadata;
import team.project.redboost.repositories.FolderMetadataRepository;
import team.project.redboost.dtos.SubFolderRequest; //Import the request

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@RestController
@RequestMapping("/api/subfolders")
public class SubFolderController {

    private final SubFolderService subFolderService;
    private final FolderMetadataRepository folderMetadataRepository;

    public SubFolderController(SubFolderService subFolderService, FolderMetadataRepository folderMetadataRepository) {
        this.subFolderService = subFolderService;
        this.folderMetadataRepository = folderMetadataRepository;
    }

    @PostMapping("/{folderMetadataId}")
    public ResponseEntity<SubFolder> createSubFolder(@PathVariable Long folderMetadataId, @RequestBody SubFolderRequest subFolderRequest) {

        Optional<FolderMetadata> folderMetadata = folderMetadataRepository.findById(folderMetadataId);
        if (folderMetadata.isPresent()) {
            SubFolder subFolder = new SubFolder();
            subFolder.setFolderName(subFolderRequest.getFolderName());
            subFolder.setFolderPath(subFolderRequest.getFolderPath()); // or generate it here
            subFolder.setFolderMetadata(folderMetadata.get());

            SubFolder createdSubFolder = subFolderService.createSubFolder(subFolder);
            return new ResponseEntity<>(createdSubFolder, HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/{folderMetadataId}")
    public ResponseEntity<List<SubFolder>> getSubFoldersByFolderMetadataId(@PathVariable Long folderMetadataId) {
        System.out.println("getSubFoldersByFolderMetadataId called with folderMetadataId: " + folderMetadataId); // Log the ID
        Optional<FolderMetadata> folderMetadata = folderMetadataRepository.findById(folderMetadataId);
        if (folderMetadata.isPresent()) {
            List<SubFolder> subFolders = subFolderService.getSubFoldersByFolderMetadataId(folderMetadata.get());
            System.out.println("Found subfolders: " + subFolders); // Log the subfolders
            return new ResponseEntity<>(subFolders, HttpStatus.OK);
        } else {
            System.out.println("FolderMetadata not found for id: " + folderMetadataId); //Log if not found
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubFolder(@PathVariable Long id) {
        try {
            subFolderService.deleteSubFolder(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content on success
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // 404 Not Found if subfolder doesn't exist
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR); // 500 Internal Server Error on other errors
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubFolder> updateSubFolder(@PathVariable Long id, @RequestBody SubFolder updatedSubFolder) {
        try {
            SubFolder updated = subFolderService.updateSubFolder(id, updatedSubFolder);
            return new ResponseEntity<>(updated, HttpStatus.OK); // 200 OK with updated subfolder
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // 404 Not Found if subfolder doesn't exist
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR); // 500 Internal Server Error on other errors
        }
    }
}
