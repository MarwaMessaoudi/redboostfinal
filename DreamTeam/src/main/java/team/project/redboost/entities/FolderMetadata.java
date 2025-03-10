package team.project.redboost.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties; //This is new!
import jakarta.persistence.*;
import team.project.redboost.entities.Category;
import team.project.redboost.entities.FileMetadata;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "folder_metadata")
public class FolderMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "folder_name")
    private String folderName;

    @Column(name = "folder_path")
    private String folderPath;

    // Relation One-to-Many avec FileMetadata
    @OneToMany(mappedBy = "folder", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference  // ADD THIS
    private List<FileMetadata> files = new ArrayList<>();

    // Relation many to one with Category
    @ManyToOne
    @JoinColumn(name = "category_id")
    @JsonBackReference  // ADD THIS
    private Category category;
    // NEW: Many-to-Many with Projet
    @ManyToMany(mappedBy = "folders")
    private List<Projet> projects = new ArrayList<>();

    // Constructeurs, Getters et Setters

    public FolderMetadata() {
    }

    public FolderMetadata(String folderName, String folderPath) {
        this.folderName = folderName;
        this.folderPath = folderPath;
    }

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

    public List<FileMetadata> getFiles() {
        return files;
    }

    public void setFiles(List<FileMetadata> files) {
        this.files = files;
    }


    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }
}
