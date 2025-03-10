package team.project.redboost.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.project.redboost.entities.FolderMetadata;
import team.project.redboost.repositories.FolderMetadataRepository;
import team.project.redboost.repositories.FileMetadataRepository;
import team.project.redboost.services.FolderMetadataService;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class FolderMetadataServiceImpl implements FolderMetadataService {

    private final FolderMetadataRepository folderMetadataRepository;
    private final FileMetadataRepository fileMetadataRepository; // Inject FileMetadataRepository

    @Autowired
    public FolderMetadataServiceImpl(FolderMetadataRepository folderMetadataRepository, FileMetadataRepository fileMetadataRepository) {
        this.folderMetadataRepository = folderMetadataRepository;
        this.fileMetadataRepository = fileMetadataRepository;
    }

    @Override
    @Transactional
    public FolderMetadata createFolderMetadata(FolderMetadata folderMetadata) {
        return folderMetadataRepository.save(folderMetadata);
    }

    @Override
    public FolderMetadata getFolderMetadataById(Long id) {
        return folderMetadataRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("FolderMetadata not found with id: " + id));
    }

    @Override
    public FolderMetadata getFolderMetadataByPath(String folderPath) {
        FolderMetadata folderMetadata = folderMetadataRepository.findByFolderPath(folderPath);
        if (folderMetadata == null) {
            throw new NoSuchElementException("FolderMetadata not found with path: " + folderPath);
        }
        return folderMetadata;
    }

    @Override
    public List<FolderMetadata> getAllFolderMetadata() {
        return folderMetadataRepository.findAll();
    }

    @Override
    @Transactional
    public FolderMetadata updateFolderMetadata(Long id, FolderMetadata folderMetadataDetails) {
        FolderMetadata folderMetadata = folderMetadataRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("FolderMetadata not found with id: " + id));

        folderMetadata.setFolderName(folderMetadataDetails.getFolderName());
        folderMetadata.setFolderPath(folderMetadataDetails.getFolderPath());
        folderMetadata.setCategory(folderMetadataDetails.getCategory());

        return folderMetadataRepository.save(folderMetadata);
    }

    @Override
    @Transactional
    public void deleteFolderMetadata(Long id) {
        if (!folderMetadataRepository.existsById(id)) {
            throw new NoSuchElementException("FolderMetadata not found with id: " + id);
        }

        // Before deleting the folder, delete all associated files
        FolderMetadata folderMetadata = folderMetadataRepository.findById(id).orElse(null);
        if (folderMetadata != null) {
            fileMetadataRepository.deleteByFolder(folderMetadata); // Delete files associated to folder
        }

        folderMetadataRepository.deleteById(id);
    }
}
