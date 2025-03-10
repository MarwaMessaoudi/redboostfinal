package team.project.redboost.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;  // Import this!

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Category")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Category name is required")  // Add this!
    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "description")
    private String description;

    // Relation One-to-Many avec FolderMetadata
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // ADD THIS
    private List<FolderMetadata> folders = new ArrayList<>();

    // Constructeurs, Getters et Setters

    public Category() {
    }

    public Category(String categoryName, String description) {
        this.categoryName = categoryName;
        this.description = description;
    }



    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<FolderMetadata> getFolders() {
        return folders;
    }

    public void setFolders(List<FolderMetadata> folders) {
        this.folders = folders;
    }
}
