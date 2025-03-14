package team.project.redboost.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReponseReclamation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "idReclamation")
    private Reclamation reclamation;


    @ManyToOne // Add this relationship
    @JoinColumn(name = "user_id") // Specify the foreign key column
    @JsonBackReference //add this
    private User user;  // Reference the User entity

    @Column(columnDefinition = "TEXT")
    private String contenu;

    @Enumerated(EnumType.STRING)
    private SenderType sender;

    private LocalDateTime dateCreation = LocalDateTime.now();

    // Enum pour le type d'expéditeur
    public enum SenderType {
        USER,
        ADMIN
    }
}