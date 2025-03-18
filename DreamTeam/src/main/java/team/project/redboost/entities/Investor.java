package team.project.redboost.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Data
@Entity
@Table(name = "investor_details")
@PrimaryKeyJoinColumn(name = "user_id") // Maps to the primary key of the User table
@EqualsAndHashCode(callSuper = true)
public class Investor extends User {


    private String name;
    private String email;
    private String phoneNumber;

    // Relationship with InvestmentRequest
    @OneToMany(mappedBy = "investor", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("investor") // Ignore investor reference inside InvestmentRequest
    private List<InvestmentRequest> investmentRequests;

    public Investor() {}

    public Investor(String name, String email, String phoneNumber) {
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
    }
}
