// src/main/java/team/project/redboost/repositories/FileMetadataRepository.java
package team.project.redboost.repositories;

import team.project.redboost.entities.FileMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import team.project.redboost.entities.FolderMetadata;

@Repository
public interface FileMetadataRepository extends JpaRepository<FileMetadata, Long> {

    FileMetadata findByFilePath(String filePath);
    FileMetadata findByFileName(String fileName);
    void deleteByFolder(FolderMetadata folder);
}