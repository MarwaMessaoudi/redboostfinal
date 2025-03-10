package team.project.redboost.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Projet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;  // ✅ Correction : "nom" → "name"
    private String sector;
    private String type;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonSerialize(using = LocalDateSerializer.class)
    private LocalDate creationDate;
    private String description;

    @Enumerated(EnumType.STRING)
    private Objectives objectives;

    @Enumerated(EnumType.STRING)
    private Statut status;

    private Double globalScore;
    private String location;


    @Column(length = 500)
    private String logoUrl;

    private String websiteUrl;
    private String foundersIds;
    private Double revenue;
    private Long numberOfEmployees;
    private Long nbFemaleEmployees;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonSerialize(using = LocalDateSerializer.class)
    private LocalDate lastUpdated;
    private String associatedSectors;
    private String technologiesUsed;
    private Double fundingGoal;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonSerialize(using = LocalDateSerializer.class)
    private LocalDate lastEvaluationDate;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "projet_id") // Foreign key in Produit table
    private List<Produit> produits = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "projet_id") // Foreign key in ServiceP table
    private List<ServiceP> services = new ArrayList<>();
    // Entrepreneurs associated with this Projet
    @ManyToMany
    @JoinTable(
            name = "projet_entrepreneur",
            joinColumns = @JoinColumn(name = "projet_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> entrepreneurs = new ArrayList<>();

    // Coaches associated with this Projet
    @ManyToMany
    @JoinTable(
            name = "projet_coach",
            joinColumns = @JoinColumn(name = "projet_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> coaches = new ArrayList<>();

    // Investors associated with this Projet
    @ManyToMany
    @JoinTable(
            name = "projet_investor",
            joinColumns = @JoinColumn(name = "projet_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> investors = new ArrayList<>();
    // NEW: Many-to-Many with FolderMetadata
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "projet_folder",
            joinColumns = @JoinColumn(name = "projet_id"),
            inverseJoinColumns = @JoinColumn(name = "folder_id")
    )
    private List<FolderMetadata> folders = new ArrayList<>();
    // NEW: One-to-Many with Phase
    @OneToMany(mappedBy = "projet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Phase> phases = new ArrayList<>();
    public enum Statut {
        EN_DEVELOPPEMENT, OPERATIONNELLE, EN_RECHERCHE_FINANCEMENT, TERMINE
    }

    public enum Objectives {
        COURT_TERME, MOYEN_TERME, LONG_TERME
    }
}
