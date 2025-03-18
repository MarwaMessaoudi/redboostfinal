package team.project.redboost.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import team.project.redboost.entities.FolderMetadata;

import java.util.List;

public interface FolderMetadataRepository extends JpaRepository<FolderMetadata, Long> {
    FolderMetadata findByFolderPath(String folderPath);
    List<FolderMetadata> findByUserId(Long userId); // New method
}
