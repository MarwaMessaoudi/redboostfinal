// User.java
package team.project.redboost.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonManagedReference; // Import!
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Random;

@Data
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "user")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Size(min = 2, max = 100)
    private String firstName;

    @Size(min = 2, max = 100)
    private String lastName;

    @Email
    @Column(unique = true)
    private String email;

    private String password; // Hashed password

    private String phoneNumber;

    @JsonIgnore
    @Enumerated(EnumType.STRING)
    private Role role;



    //to avoid adding this attribute to the database
    @Transient
    private String confirm_password;



    private String confirm_code;


    private boolean isActive = false;
    // OAuth2 fields
    private String provider; // "google" or "linkedin"
    private String providerId; // OAuth2 ID
    // Projects where this User is an Entrepreneur
    @ManyToMany(mappedBy = "entrepreneurs")
    private List<Projet> entrepreneurProjects = new ArrayList<>();

    // Projects where this User is a Coach
    @ManyToMany(mappedBy = "coaches")
    private List<Projet> coachProjects = new ArrayList<>();

    // Projects where this User is an Investor
    @ManyToMany(mappedBy = "investors")
    private List<Projet> investorProjects = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference //  Serialize this side
    private List<Reclamation> reclamations;
    // Relationship to Reclamation


    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true) // Add this
    private List<ReponseReclamation> reponseReclamations;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(() -> "ROLE_" + role.name());
    }

    @Override
    public String getUsername() { return email; }
    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
    public boolean getisActive() {
        return isActive;
    }

    public void setActive(boolean isActive) {
        this.isActive = isActive;
    }
    public String getConfirm_code() {
        return confirm_code;
    }

    public void setConfirm_code(String confirm_code) {
        this.confirm_code = confirm_code;
    }



    public String getConfirm_password() {
        return confirm_password;
    }

    public void setConfirm_password(String confirm_password) {
        this.confirm_password = confirm_password;
    }

    public String generateConfirmationCode() {
        return String.format("%06d", new Random().nextInt(999999));
    }
    @JsonProperty("role")
    public String getRoleName() {
        return (role != null) ? role.name() : null;
    }


}