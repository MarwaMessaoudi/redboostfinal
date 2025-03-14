package team.project.redboost.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"}) // Prevent Hibernate proxy issues
public class InvestmentRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Investor relationship
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "investor_id", nullable = false)
    @JsonIgnoreProperties("investmentRequests") // Ignore the back reference
    private Investor investor;

    // Projet relationship (changed from Startup)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "projet_id", nullable = false) // Changed from startup_id to projet_id
    @JsonIgnoreProperties("investmentRequests") // Ignore the back reference
    private Projet projet; // Changed from Startup to Projet

    @Enumerated(EnumType.STRING)
    private InvestmentStatus status; // PENDING, ACCEPTED, DECLINED

    private String message;
    private double proposedAmount;
    private LocalDateTime requestDate;

    public InvestmentRequest() {
        this.requestDate = LocalDateTime.now();
        this.status = InvestmentStatus.PENDING;
    }
}