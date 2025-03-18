package team.project.redboost.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;
import team.project.redboost.entities.Projet;
import team.project.redboost.entities.Role;
import team.project.redboost.entities.User;
import team.project.redboost.services.ProjetService;
import team.project.redboost.utils.FileStorageUtil;

import jakarta.transaction.Transactional;
import java.io.IOException;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/projets")
public class ProjetController {

    private final ProjetService projetService;
    private final ObjectMapper objectMapper;

    public ProjetController(ProjetService projetService) {
        this.projetService = projetService;
        this.objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @PostMapping(value = "/AddProjet", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createProjet(
            @RequestPart("projet") String projetJson,
            @RequestPart(value = "logourl", required = false) MultipartFile file
    ) {
        try {
            User user = projetService.getCurrentUser();
            Long entrepreneurId = user.getId();

            Projet projet = objectMapper.readValue(projetJson, Projet.class);
            String imageUrl = (file != null && !file.isEmpty()) ? FileStorageUtil.saveFile(file) : null;

            Projet savedProjet = projetService.createProjet(projet, imageUrl, entrepreneurId);
            return ResponseEntity.ok(savedProjet);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l’enregistrement: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping(value = "/UpdateProjet/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProjet(
            @PathVariable Long id,
            @RequestPart("projet") String projetJson,
            @RequestPart(value = "logourl", required = false) MultipartFile file
    ) {
        try {
            Projet projetDetails = objectMapper.readValue(projetJson, Projet.class);
            String imageUrl = (file != null && !file.isEmpty()) ? FileStorageUtil.saveFile(file) : null;
            Projet updatedProjet = projetService.updateProjet(id, projetDetails, imageUrl);
            return ResponseEntity.ok(updatedProjet);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erreur lors de l’enregistrement du fichier.");
        }
    }

    @GetMapping("/GetAll")
    public ResponseEntity<List<Projet>> getAllProjets() {
        return ResponseEntity.ok(projetService.getAllProjets());
    }

    @GetMapping("/GetProjet/{id}")
    public ResponseEntity<?> getProjetById(@PathVariable Long id) {
        try {
            Projet projet = projetService.getProjetById(id);
            return ResponseEntity.ok(projet);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/DeleteProjet/{id}")
    public ResponseEntity<?> deleteProjet(@PathVariable Long id) {
        try {
            projetService.deleteProjet(id);
            return ResponseEntity.ok("Projet supprimé avec succès !");
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/Getcardfounder/{userId}")
    public ResponseEntity<List<Object[]>> getProjetCardByUserId(@PathVariable Long userId) {
        List<Object[]> projectCards = projetService.getProjetCardByUserId(userId);
        return ResponseEntity.ok(projectCards);
    }

    @PostMapping("/{projetId}/entrepreneur/{userId}")
    public ResponseEntity<?> addEntrepreneurToProjet(
            @PathVariable Long projetId,
            @PathVariable Long userId
    ) {
        try {
            Projet updatedProjet = projetService.addEntrepreneurToProjet(projetId, userId);
            return ResponseEntity.ok(updatedProjet);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/{projetId}/coach/{userId}")
    public ResponseEntity<Projet> addCoachToProjet(
            @PathVariable Long projetId,
            @PathVariable Long userId
    ) {
        try {
            Projet updatedProjet = projetService.addCoachToProjet(projetId, userId);
            return ResponseEntity.ok(updatedProjet);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{projetId}/investor/{userId}")
    public ResponseEntity<Projet> addInvestorToProjet(
            @PathVariable Long projetId,
            @PathVariable Long userId
    ) {
        try {
            Projet updatedProjet = projetService.addInvestorToProjet(projetId, userId);
            return ResponseEntity.ok(updatedProjet);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{projetId}/invite/{userId}")
    public ResponseEntity<?> inviteCollaborator(
            @PathVariable Long projetId,
            @PathVariable Long userId
    ) {
        try {
            Projet updatedProjet = projetService.inviteCollaborator(projetId, userId);
            return ResponseEntity.ok(updatedProjet);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Project or user not found");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }
    }

    @PostMapping("/{projetId}/accept/{userId}")
    public ResponseEntity<?> acceptInvitation(
            @PathVariable Long projetId,
            @PathVariable Long userId
    ) {
        try {
            Projet updatedProjet = projetService.acceptInvitation(projetId, userId);
            return ResponseEntity.ok(updatedProjet);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/{projetId}/decline/{userId}")
    public ResponseEntity<?> declineInvitation(
            @PathVariable Long projetId,
            @PathVariable Long userId
    ) {
        try {
            Projet updatedProjet = projetService.declineInvitation(projetId, userId);
            return ResponseEntity.ok(updatedProjet);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/{projetId}/eligible-collaborators")
    @Transactional
    public ResponseEntity<?> getEligibleCollaborators(@PathVariable Long projetId) {
        try {
            Projet projet = projetService.findProjetEntityById(projetId);
            User currentUser = projetService.getCurrentUser();
            if (!currentUser.getId().equals(projet.getFounder().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Only the project founder can view eligible collaborators");
            }

            List<User> allUsers = projetService.getAllUsers();
            List<User> eligibleCollaborators = allUsers.stream()
                    .filter(user -> user.getRole() == Role.ENTREPRENEUR)
                    .filter(user -> !projet.getEntrepreneurs().contains(user))
                    .filter(user -> projet.getPendingCollaborator() == null || !projet.getPendingCollaborator().getId().equals(user.getId()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(eligibleCollaborators);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @GetMapping("/pending-invitations")
    @Transactional
    public ResponseEntity<?> getPendingInvitations(@RequestParam("email") String email) {
        try {
            // Fetch user by email directly
            User currentUser = projetService.getUserByEmail(email);
            if (currentUser == null) {
                System.err.println("User not found for email: " + email);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not found or invalid email");
            }

            System.out.println("Fetching pending invitations for user: " + currentUser.getEmail());

            List<Projet> projects = projetService.getAllProjets().stream()
                    .filter(projet -> {
                        try {
                            return projet.getPendingCollaborator() != null &&
                                    projet.getPendingCollaborator().getId().equals(currentUser.getId());
                        } catch (Exception e) {
                            System.err.println("Error processing projet: " + projet.getId() + " - " + e.getMessage());
                            return false;
                        }
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            System.err.println("Failed to fetch pending invitations: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching pending invitations: " + e.getMessage());
        }
    }
}