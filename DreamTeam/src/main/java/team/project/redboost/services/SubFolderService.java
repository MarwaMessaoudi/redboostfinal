package team.project.redboost.services;

import org.springframework.stereotype.Service;
import team.project.redboost.entities.SubFolder;
import team.project.redboost.repositories.SubFolderRepository;

import java.util.List;
import java.util.NoSuchElementException;
import team.project.redboost.entities.FolderMetadata;

@Service
public class SubFolderService {

    private final SubFolderRepository subFolderRepository;

    public SubFolderService(SubFolderRepository subFolderRepository) {
        this.subFolderRepository = subFolderRepository;
    }

    public SubFolder createSubFolder(SubFolder subFolder) {
        return subFolderRepository.save(subFolder);
    }

    public List<SubFolder> getSubFoldersByFolderMetadataId(FolderMetadata folderMetadata) {
        return subFolderRepository.findByFolderMetadata(folderMetadata);
    }

    public void deleteSubFolder(Long id) {
        if (subFolderRepository.existsById(id)) {
            subFolderRepository.deleteById(id);
        } else {
            throw new NoSuchElementException("SubFolder not found with id: " + id);
        }
    }

    public SubFolder updateSubFolder(Long id, SubFolder updatedSubFolder) {
        return subFolderRepository.findById(id)
                .map(subFolder -> {
                    subFolder.setFolderName(updatedSubFolder.getFolderName());
                    subFolder.setFolderPath(updatedSubFolder.getFolderPath());
                    //subFolder.setFolderMetadata(updatedSubFolder.getFolderMetadata()); //Don't let the folderMetadata to be changed

                    return subFolderRepository.save(subFolder);
                })
                .orElseThrow(() -> new NoSuchElementException("SubFolder not found with id: " + id));
    }
}
