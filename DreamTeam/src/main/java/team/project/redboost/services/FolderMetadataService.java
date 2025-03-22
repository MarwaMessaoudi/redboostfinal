// FolderMetadataService.java
package team.project.redboost.services;

import team.project.redboost.entities.FolderMetadata;

import java.util.List;
import java.util.NoSuchElementException;

public interface FolderMetadataService {

    FolderMetadata createFolderMetadata(FolderMetadata folderMetadata);

    FolderMetadata getFolderMetadataById(Long id);

    FolderMetadata getFolderMetadataByPath(String folderPath);

    List<FolderMetadata> getAllFolderMetadata();

    FolderMetadata updateFolderMetadata(Long id, FolderMetadata folderMetadataDetails);

    void deleteFolderMetadata(Long id);

    List<FolderMetadata> getAllFolderMetadataForUser(Long userId);  // New method
}
