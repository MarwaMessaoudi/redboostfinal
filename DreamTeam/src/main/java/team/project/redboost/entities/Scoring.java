package team.project.redboost.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class Scoring {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private static final Long utilisateurId = 1L;  // Utilisateur statique avec ID 1

    private int scoreTotal;
    private LocalDateTime dateMiseAJour;

    @Enumerated(EnumType.STRING)
    private Niveau niveau;

    private int seuilMinNiveau;
    private int seuilMaxNiveau;

    public Scoring(int scoreTotal, Niveau niveau, int seuilMinNiveau, int seuilMaxNiveau) {
        this.scoreTotal = scoreTotal;
        this.niveau = niveau;
        this.seuilMinNiveau = seuilMinNiveau;
        this.seuilMaxNiveau = seuilMaxNiveau;
        this.dateMiseAJour = LocalDateTime.now();
    }
}
