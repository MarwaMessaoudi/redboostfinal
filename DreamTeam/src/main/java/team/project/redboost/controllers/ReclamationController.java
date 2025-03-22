package team.project.redboost.controllers;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import team.project.redboost.authentif.JwtUtil;
import team.project.redboost.dto.ReclamationDTO;
import team.project.redboost.entities.Reclamation;
import team.project.redboost.entities.User;
import team.project.redboost.entities.StatutReclamation; // Import the enum!
import team.project.redboost.repositories.UserRepository;
import team.project.redboost.services.ReclamationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/reclamations")
@CrossOrigin(origins = "http://localhost:4200")
public class ReclamationController {
    private static final Logger logger = LoggerFactory.getLogger(ReclamationController.class);

    @Autowired
    private ReclamationService reclamationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    JwtUtil jwtUtil;
    // Create a new reclamation
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Reclamation> createReclamation(@RequestBody ReclamationDTO reclamationDTO, HttpServletRequest request) {
        try {
            // Extract the token from the request header
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.error("Authorization header is missing or invalid");
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.replace("Bearer ", "");

            // Extract the userId from the token
            String userId = jwtUtil.extractUserId(token);
            if (userId == null) {
                logger.error("Could not extract userId from token");
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            logger.info("Extracted userId from token: {}", userId);

            // Fetch the User entity from the database
            User user = userRepository.findById(Long.valueOf(userId)).orElse(null);
            if (user == null) {
                logger.error("User not found with id: {}", userId);
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            // Create and populate a new Reclamation
            Reclamation reclamation = new Reclamation();
            reclamation.setSujet(reclamationDTO.getSujet());
            reclamation.setDescription(reclamationDTO.getDescription());
            reclamation.setCategorie(reclamationDTO.getCategorie());
            reclamation.setDate(new Date()); // Use server's current time
            reclamation.setStatut(StatutReclamation.NOUVELLE); // Default status
            reclamation.setUser(user);

            // Save the reclamation
            Reclamation createdReclamation = reclamationService.createReclamation(reclamation);
            return new ResponseEntity<>(createdReclamation, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating reclamation", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get all reclamations for the authenticated user
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Reclamation>> getAllReclamations(@AuthenticationPrincipal UserDetails userDetails) {
        // Fetch the User entity from the database using the email from UserDetails
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED); // User not found
        }

        // Fetch reclamations for the authenticated user
        List<Reclamation> reclamations = reclamationService.getAllReclamationsByUser(user);
        return new ResponseEntity<>(reclamations, HttpStatus.OK);
    }

    // Get a reclamation by ID
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Reclamation> getReclamationById(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        // Fetch the User entity from the database using the email from UserDetails
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED); // User not found
        }

        // Fetch the reclamation by ID and user
        Reclamation reclamation = reclamationService.getReclamationByIdAndUser(id, user);
        if (reclamation != null) {
            return new ResponseEntity<>(reclamation, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Update a reclamation
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Reclamation> updateReclamation(@PathVariable Long id, @RequestBody Reclamation reclamationDetails, @AuthenticationPrincipal UserDetails userDetails) {
        // Fetch the User entity from the database using the email from UserDetails
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED); // User not found
        }

        // Update the reclamation
        Reclamation updatedReclamation = reclamationService.updateReclamation(id, reclamationDetails, user);
        if (updatedReclamation != null) {
            return new ResponseEntity<>(updatedReclamation, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a reclamation
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteReclamation(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        // Fetch the User entity from the database using the email from UserDetails
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED); // User not found
        }

        // Delete the reclamation
        boolean isDeleted = reclamationService.deleteReclamation(id, user);
        if (isDeleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PatchMapping("/{id}/statut")  // Use PATCH for partial updates
    @PreAuthorize("hasRole('ADMIN')") // Only allow admins to change the status
    public ResponseEntity<Reclamation> updateReclamationStatus(
            @PathVariable Long id,
            @RequestBody StatutUpdateRequest request) { // Or @RequestBody if passing a JSON object

        try {
            StatutReclamation nouveauStatut = request.getStatut(); // Get the statut from the request object

            Reclamation updatedReclamation = reclamationService.updateReclamationStatut(id, nouveauStatut);

            if (updatedReclamation != null) {
                return ResponseEntity.ok(updatedReclamation);
            } else {
                return ResponseEntity.notFound().build(); // Or throw an exception
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null); // Invalid enum value
        }
    }
}

class StatutUpdateRequest {
    private StatutReclamation statut;

    public StatutReclamation getStatut() {
        return statut;
    }

    public void setStatut(StatutReclamation statut) {
        this.statut = statut;
    }
}