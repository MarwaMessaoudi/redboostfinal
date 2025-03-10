package team.project.redboost.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "sub_folder")
public class SubFolder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "folder_name")
    private String folderName;

    @Column(name = "folder_path")
    private String folderPath;

    @ManyToOne
    @JoinColumn(name = "folder_metadata_id")
    private FolderMetadata folderMetadata;

    public SubFolder() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFolderName() {
        return folderName;
    }

    public void setFolderName(String folderName) {
        this.folderName = folderName;
    }

    public String getFolderPath() {
        return folderPath;
    }

    public void setFolderPath(String folderPath) {
        this.folderPath = folderPath;
    }

    public FolderMetadata getFolderMetadata() {
        return folderMetadata;
    }

    public void setFolderMetadata(FolderMetadata folderMetadata) {
        this.folderMetadata = folderMetadata;
    }

}
