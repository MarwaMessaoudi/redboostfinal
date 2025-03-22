// src/main/java/team/project/redboost/services/FileMetadataService.java
package team.project.redboost.services;

import team.project.redboost.entities.FileMetadata; // Importe la classe FileMetadata (l'entité JPA).
import java.util.List; // Importe la classe List pour gérer les collections.

public interface FileMetadataService {

    FileMetadata createFileMetadata(FileMetadata fileMetadata); // Déclare une méthode pour créer une nouvelle FileMetadata.
    FileMetadata getFileMetadataById(Long id); // Déclare une méthode pour récupérer une FileMetadata par son ID.
    FileMetadata getFileMetadataByPath(String path); // Déclare une méthode pour récupérer une FileMetadata par son chemin de fichier.
    List<FileMetadata> getAllFileMetadata(); // Déclare une méthode pour récupérer toutes les FileMetadata.
    FileMetadata updateFileMetadata(Long id, FileMetadata fileMetadata); // Déclare une méthode pour mettre à jour une FileMetadata existante.
    void deleteFileMetadata(Long id); // Déclare une méthode pour supprimer une FileMetadata par son ID.

}