//FolderMetadataService.java
package team.project.redboost.services;

import team.project.redboost.entities.FolderMetadata; // Importe la classe FolderMetadata (l'entité JPA).

import java.util.List; // Importe la classe List pour gérer les collections.

public interface FolderMetadataService {

    FolderMetadata createFolderMetadata(FolderMetadata folderMetadata); // Déclare une méthode pour créer une nouvelle FolderMetadata.
    FolderMetadata getFolderMetadataById(Long id); // Déclare une méthode pour récupérer une FolderMetadata par son ID.
    FolderMetadata getFolderMetadataByPath(String folderPath); // Déclare une méthode pour récupérer une FolderMetadata par son chemin de dossier.
    List<FolderMetadata> getAllFolderMetadata(); // Déclare une méthode pour récupérer toutes les FolderMetadata.
    FolderMetadata updateFolderMetadata(Long id, FolderMetadata folderMetadata); // Déclare une méthode pour mettre à jour une FolderMetadata existante.
    void deleteFolderMetadata(Long id); // Déclare une méthode pour supprimer une FolderMetadata par son ID.
}