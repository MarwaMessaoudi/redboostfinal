package team.project.redboost.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "pending_coach_requests")
@Data
public class CoachRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version // Optimistic locking
    private Integer version;

    // Common fields from User
    @Size(min = 2, max = 100)
    private String firstName;

    @Size(min = 2, max = 100)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phoneNumber;



    private String linkedin;

    @Enumerated(EnumType.STRING)
    private Role role = Role.USER; // Default to USER until approved

    // Specific fields from Coach
    @Size(min = 2, max = 100)
    private String specialization;

    private Integer yearsOfExperience;

    // Status and timestamp
    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();
}

