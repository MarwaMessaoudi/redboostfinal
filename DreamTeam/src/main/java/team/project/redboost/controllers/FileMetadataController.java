package team.project.redboost.controllers;

import team.project.redboost.entities.FileMetadata; // Importe l'entité FileMetadata.
import team.project.redboost.services.FileMetadataService; // Importe le service FileMetadataService.
import org.springframework.beans.factory.annotation.Autowired; // Importe l'annotation Autowired.
import org.springframework.http.HttpStatus; // Importe la classe HttpStatus.
import org.springframework.http.ResponseEntity; // Importe la classe ResponseEntity.
import org.springframework.web.bind.annotation.*; // Importe les annotations de mapping des requêtes HTTP.

import java.util.List; // Importe la classe List.
import java.util.NoSuchElementException; // Importe la classe NoSuchElementException.

@RestController // Indique que cette classe est un contrôleur REST.
@RequestMapping("/api/files") // Définit le chemin de base pour les requêtes.
public class    FileMetadataController {

    private final FileMetadataService fileMetadataService; // Déclare le service FileMetadataService.

    @Autowired // Injecte une instance de FileMetadataService.
    public FileMetadataController(FileMetadataService fileMetadataService) {
        this.fileMetadataService = fileMetadataService;
    }

    @PostMapping // Définit un endpoint pour la création de FileMetadata (POST).
    public ResponseEntity<FileMetadata> createFileMetadata(@RequestBody FileMetadata fileMetadata) {
        FileMetadata createdFileMetadata = fileMetadataService.createFileMetadata(fileMetadata); // Appelle le service pour créer le FileMetadata.
        return new ResponseEntity<>(createdFileMetadata, HttpStatus.CREATED); // Retourne une réponse avec le FileMetadata créé et le status CREATED.
    }

    @GetMapping("/{id}") // Définit un endpoint pour la récupération de FileMetadata par ID (GET).
    public ResponseEntity<FileMetadata> getFileMetadataById(@PathVariable Long id) {
        try {
            FileMetadata fileMetadata = fileMetadataService.getFileMetadataById(id); // Appelle le service pour récupérer le FileMetadata par ID.
            return new ResponseEntity<>(fileMetadata, HttpStatus.OK); // Retourne une réponse avec le FileMetadata et le status OK.
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // Retourne une réponse avec le status NOT_FOUND si le FileMetadata n'est pas trouvé.
        }
    }

    @GetMapping("/path") // Définit un endpoint pour la récupération de FileMetadata par chemin (GET).
    public ResponseEntity<FileMetadata> getFileMetadataByPath(@RequestParam String path) {
        try {
            FileMetadata fileMetadata = fileMetadataService.getFileMetadataByPath(path); // Appelle le service pour récupérer le FileMetadata par chemin.
            return new ResponseEntity<>(fileMetadata, HttpStatus.OK); // Retourne une réponse avec le FileMetadata et le status OK.
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // Retourne une réponse avec le status NOT_FOUND si le FileMetadata n'est pas trouvé.
        }
    }

    @GetMapping // Définit un endpoint pour la récupération de tous les FileMetadata (GET).
    public ResponseEntity<List<FileMetadata>> getAllFileMetadata() {
        List<FileMetadata> fileMetadataList = fileMetadataService.getAllFileMetadata(); // Appelle le service pour récupérer tous les FileMetadata.
        return new ResponseEntity<>(fileMetadataList, HttpStatus.OK); // Retourne une réponse avec la liste de FileMetadata et le status OK.
    }

    @PutMapping("/{id}") // Définit un endpoint pour la mise à jour de FileMetadata par ID (PUT).
    public ResponseEntity<FileMetadata> updateFileMetadata(@PathVariable Long id, @RequestBody FileMetadata fileMetadata) {
        try {
            FileMetadata updatedFileMetadata = fileMetadataService.updateFileMetadata(id, fileMetadata); // Appelle le service pour mettre à jour le FileMetadata.
            return new ResponseEntity<>(updatedFileMetadata, HttpStatus.OK); // Retourne une réponse avec le FileMetadata mis à jour et le status OK.
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // Retourne une réponse avec le status NOT_FOUND si le FileMetadata n'est pas trouvé.
        }
    }

    @DeleteMapping("/{id}") // Définit un endpoint pour la suppression de FileMetadata par ID (DELETE).
    public ResponseEntity<Void> deleteFileMetadata(@PathVariable Long id) {
        try {
            fileMetadataService.deleteFileMetadata(id); // Appelle le service pour supprimer le FileMetadata.
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // Retourne une réponse avec le status NO_CONTENT.
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // Retourne une réponse avec le status NOT_FOUND si le FileMetadata n'est pas trouvé.
        }
    }
}
