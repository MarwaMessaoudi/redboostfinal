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

   // Startup relationship
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "startup_id", nullable = false)
    @JsonIgnoreProperties("investmentRequests") // Ignore the back reference
    private Startup startup;

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
