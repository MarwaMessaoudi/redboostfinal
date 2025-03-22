package team.project.redboost.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import team.project.redboost.dto.ReponseContenuDTO;
import team.project.redboost.entities.ReponseReclamation;
import team.project.redboost.entities.User;
import team.project.redboost.services.ReponseReclamationService;
import team.project.redboost.repositories.UserRepository; // Import UserRepository
import team.project.redboost.entities.Reclamation; //Import reclamation
import team.project.redboost.repositories.ReclamationRepository; //Import reclamation

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reclamations/{idReclamation}/responses") // Typo Fix
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class ReponseReclamationController {

    private final ReponseReclamationService reponseService;
    private final UserRepository userRepository; // Inject UserRepository
    private final ReclamationRepository reclamationRepository;

    // Récupérer toutes les réponses pour une réclamation
    @GetMapping
    public List<ReponseReclamation> getResponsesByReclamation(@PathVariable Long idReclamation) { // Typo Fix
        return reponseService.getReponsesByReclamation(idReclamation);
    }

    // Ajouter une nouvelle réponse utilisateur
    @PostMapping("/user") // Remove {userId} from URL
    public ResponseEntity<ReponseReclamation> createUserReponse(
            @PathVariable Long idReclamation,
            @RequestBody ReponseContenuDTO reponseDTO) {

        // Get the currently authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName(); // Usually the email

        // Retrieve the User object from the database based on the username (email)
        User user = userRepository.findByEmail(username);

        if (user == null) { // Handle the null case correctly
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED); // Or HttpStatus.FORBIDDEN
        }

        Optional<Reclamation>  reclamationOptional = reclamationRepository.findById(idReclamation);
        if(reclamationOptional.isPresent()){

            ReponseReclamation saved = reponseService.createUserReponse(idReclamation, reponseDTO.getContenu(), user);

            return new ResponseEntity<>(saved, HttpStatus.CREATED);

        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);

    }

    // Ajouter une nouvelle réponse admin
    @PostMapping("/admin") // Remove {adminId} from the URL
    public ResponseEntity<ReponseReclamation> createAdminReponse(
            @PathVariable Long idReclamation,
            @RequestBody String content) {

        // Get the currently authenticated admin (assuming you have a way to identify admins)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // Retrieve the Admin User object from the database based on the username (email)
        User admin = userRepository.findByEmail(username);

        if (admin == null || !admin.getRoleName().equals("ADMIN")) { // Check if user is an admin
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED); // Or HttpStatus.FORBIDDEN
        }

        Optional<Reclamation>  reclamationOptional = reclamationRepository.findById(idReclamation);
        if(reclamationOptional.isPresent()){
            ReponseReclamation saved = reponseService.createAdminReponse(idReclamation, content, admin);
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        }  return new ResponseEntity<>(HttpStatus.NOT_FOUND);

    }


    // Mettre à jour une réponse existante
    @PutMapping("/{idResponse}")  // Typo Fix
    public ResponseEntity<ReponseReclamation> updateReponse(
            @PathVariable Long idResponse, // Typo Fix
            @RequestBody ReponseReclamation updatedResponse) { // Typo Fix
        ReponseReclamation updated = reponseService.updateReponse(idResponse, updatedResponse); // Typo Fix
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    // Supprimer une réponse
    @DeleteMapping("/{idResponse}")  // Typo Fix
    public ResponseEntity<Void> deleteReponse(@PathVariable Long idResponse) { // Typo Fix
        return reponseService.deleteReponse(idResponse) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}