package team.project.redboost.entities;

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

    @Column(columnDefinition = "TEXT")
    private String contenu;

    @Enumerated(EnumType.STRING)
    private SenderType sender;

    @Column(name = "user_id")
    private Long userId;

    private LocalDateTime dateCreation = LocalDateTime.now();

    // Enum pour le type d'expéditeur
    public enum SenderType {
        USER,
        ADMIN
    }
}