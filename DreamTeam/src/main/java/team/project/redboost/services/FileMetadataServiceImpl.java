// src/main/java/team/project/redboost/services/FileMetadataServiceImpl.java
package team.project.redboost.services;

import org.springframework.beans.factory.annotation.Autowired; // Importe l'annotation Autowired pour l'injection de dépendances.
import org.springframework.stereotype.Service; // Importe l'annotation Service pour indiquer que cette classe est un service Spring.
import org.springframework.transaction.annotation.Transactional; // Importe l'annotation Transactional pour la gestion des transactions.
import team.project.redboost.config.TestUserConfiguration; // Importe la classe TestUserConfiguration.
import team.project.redboost.entities.FileMetadata; // Importe la classe FileMetadata (l'entité JPA).
import team.project.redboost.repositories.FileMetadataRepository; // Importe l'interface FileMetadataRepository pour accéder aux données.

import java.util.List; // Importe la classe List pour gérer les collections.
import java.util.NoSuchElementException; // Importe la classe NoSuchElementException pour gérer les exceptions.

@Service // Indique que cette classe est un service Spring.
public class FileMetadataServiceImpl implements FileMetadataService { // Implémente l'interface FileMetadataService.

    private final FileMetadataRepository fileMetadataRepository; // Déclare une dépendance vers FileMetadataRepository.

    @Autowired // Injecte automatiquement une instance de FileMetadataRepository dans ce service.
    public FileMetadataServiceImpl(FileMetadataRepository fileMetadataRepository) {
        this.fileMetadataRepository = fileMetadataRepository;
    }

    @Override
    @Transactional // Indique que cette méthode est transactionnelle.
    public FileMetadata createFileMetadata(FileMetadata fileMetadata) {
        // Récupérer l'ID de l'utilisateur de test à partir de la configuration
        Long userId = TestUserConfiguration.getTestUserId(); // Récupère l'ID de l'utilisateur de test.
        long spaceLimit = TestUserConfiguration.getTestUserSpaceLimit(); // Récupère la limite d'espace disque de l'utilisateur de test.

        // Simuler une vérification de l'espace disque
        long fileSize = fileMetadata.getFileSize(); // Récupère la taille du fichier.
        if (fileSize > spaceLimit) { // Remplacez ceci par une logique plus sophistiquée si nécessaire // Vérifie si la taille du fichier dépasse la limite d'espace disque.
            throw new IllegalStateException("Pas assez d'espace disque pour l'utilisateur " + userId); // Lance une exception si l'espace disque est insuffisant.
        }

        return fileMetadataRepository.save(fileMetadata); // Sauvegarde la FileMetadata dans la base de données.
    }

    @Override
    public FileMetadata getFileMetadataById(Long id) {
        return fileMetadataRepository.findById(id) // Recherche une FileMetadata par son ID.
                .orElseThrow(() -> new NoSuchElementException("FileMetadata not found with id: " + id)); // Lance une exception si la FileMetadata n'est pas trouvée.
    }

    @Override
    public FileMetadata getFileMetadataByPath(String path) {
        FileMetadata fileMetadata = fileMetadataRepository.findByFilePath(path); // Recherche une FileMetadata par son chemin.
        if (fileMetadata == null) { // Vérifie si la FileMetadata est trouvée.
            throw new NoSuchElementException("FileMetadata not found with path: " + path); // Lance une exception si la FileMetadata n'est pas trouvée.
        }
        return fileMetadata; // Retourne la FileMetadata trouvée.
    }

    @Override
    public List<FileMetadata> getAllFileMetadata() {
        return fileMetadataRepository.findAll(); // Récupère toutes les FileMetadata de la base de données.
    }

    @Override
    @Transactional // Indique que cette méthode est transactionnelle.
    public FileMetadata updateFileMetadata(Long id, FileMetadata fileMetadataDetails) {
        FileMetadata fileMetadata = fileMetadataRepository.findById(id) // Recherche une FileMetadata par son ID.
                .orElseThrow(() -> new NoSuchElementException("FileMetadata not found with id: " + id)); // Lance une exception si la FileMetadata n'est pas trouvée.

        fileMetadata.setFileName(fileMetadataDetails.getFileName()); // Met à jour le nom du fichier.
        fileMetadata.setFilePath(fileMetadataDetails.getFilePath()); // Met à jour le chemin du fichier.
        fileMetadata.setFileSize(fileMetadataDetails.getFileSize()); // Met à jour la taille du fichier.
        fileMetadata.setContentType(fileMetadataDetails.getContentType()); // Met à jour le type de contenu du fichier.

        return fileMetadataRepository.save(fileMetadata); // Sauvegarde la FileMetadata mise à jour dans la base de données.
    }

    @Override
    @Transactional // Indique que cette méthode est transactionnelle.
    public void deleteFileMetadata(Long id) {
        if (!fileMetadataRepository.existsById(id)) { // Vérifie si la FileMetadata existe.
            throw new NoSuchElementException("FileMetadata not found with id: " + id); // Lance une exception si la FileMetadata n'existe pas.
        }
        fileMetadataRepository.deleteById(id); // Supprime la FileMetadata de la base de données.
    }
}
