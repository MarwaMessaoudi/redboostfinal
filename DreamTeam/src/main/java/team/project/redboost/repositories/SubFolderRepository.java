package team.project.redboost.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import team.project.redboost.entities.SubFolder;
import team.project.redboost.entities.FolderMetadata;

import java.util.List;

public interface SubFolderRepository extends JpaRepository<SubFolder, Long> {
    List<SubFolder> findByFolderMetadata(FolderMetadata folderMetadata);
    boolean existsById(Long id);
}
