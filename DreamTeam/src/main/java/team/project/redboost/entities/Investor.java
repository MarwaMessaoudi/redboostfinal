package team.project.redboost.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Setter
@Getter
@Entity
@Table(name = "investor")
public class Investor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // Raison sociale (Company name)
    private String email; // Adresse électronique (Email)
    private String phoneNumber; // Tél (Telephone)
    private String legalRepresentative; // Le représentant légal (Legal representative)
    private String governorate; // Gouvernorat (Region/State)
    private String address; // Adresse (Physical address)
    private String uniqueIdentifier; // Identifiant unique (Tax ID or Registration Number)
    private String legalForm; // Forme juridique (Legal form, e.g., SARL, SA)
    private Double shareCapital; // Capital social (Share capital)

    @OneToMany(mappedBy = "investor", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("investor")
    private List<InvestmentRequest> investmentRequests;

    public Investor() {}

    public Investor(String name, String email, String phoneNumber, String legalRepresentative,
                    String governorate, String address, String uniqueIdentifier,
                    String legalForm, Double shareCapital) {
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.legalRepresentative = legalRepresentative;
        this.governorate = governorate;
        this.address = address;
        this.uniqueIdentifier = uniqueIdentifier;
        this.legalForm = legalForm;
        this.shareCapital = shareCapital;
    }
}