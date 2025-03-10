package team.project.redboost.repositories;

import team.project.redboost.entities.FolderMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FolderMetadataRepository extends JpaRepository<FolderMetadata, Long> {
    FolderMetadata findByFolderPath(String folderPath);
}