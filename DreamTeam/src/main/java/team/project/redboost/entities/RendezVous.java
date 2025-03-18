package team.project.redboost.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "rendez_vous")
public class RendezVous {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String heure;

    @Column(nullable = false, length = 500)
    private String description;

    // Remove this field.  It's redundant with the Coach relationship.
    //@Column(name = "coach_id", nullable = false)
    //private Long coachId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING; // Valeur par défaut "PENDING"


    @ManyToOne
    @JoinColumn(name = "coach_id", nullable = false)
    private Coach coach; // Relationship to Coach


    @ManyToOne
    @JoinColumn(name = "entrepreneur_id", nullable = false)
    private Entrepreneur entrepreneur; // Relationship to Entrepreneur

    // Enum pour les statuts
    public enum Status {
        PENDING, ACCEPTED, REJECTED
    }

    // Getters and setters exist because of the @Data annotation from Lombok.
    // No need to define them explicitly.
}