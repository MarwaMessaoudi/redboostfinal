package team.project.redboost.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import team.project.redboost.entities.Coach;
import team.project.redboost.entities.Entrepreneur;
import team.project.redboost.entities.RendezVous;
import team.project.redboost.repositories.CoachRepository;
import team.project.redboost.repositories.EntrepreneurRepository;
import team.project.redboost.repositories.RendezVousRepository;
import team.project.redboost.services.RendezVousService;
import team.project.redboost.services.GoogleCalendarService;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/rendezvous")
@CrossOrigin(origins = "http://localhost:4200", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
public class RendezVousController {

    @Autowired
    private GoogleCalendarService googleCalendarService;
    @Autowired
    private RendezVousService rendezVousService;

    private static final Logger logger = LoggerFactory.getLogger(RendezVousController.class);
    @Autowired
    private CoachRepository coachRepository;
    @Autowired
    private EntrepreneurRepository entrepreneurRepository;

    @Operation(summary = "Mettre à jour le statut d’un rendez-vous et l’intégrer à Google Calendar si accepté")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Statut mis à jour, et ajouté à Google Calendar si accepté"),
            @ApiResponse(responseCode = "404", description = "Rendez-vous non trouvé"),
            @ApiResponse(responseCode = "500", description = "Erreur lors de la mise à jour ou de l’ajout à Google Calendar")
    })
  /*  @PatchMapping("/update-status/{id}")
    public ResponseEntity<ResponseMessage> updateRendezVousStatus(
            @PathVariable Long id,
            @RequestBody RendezVous.Status status,
            Authentication authentication) { // Ajouter Authentication comme paramètre
        try {
            Optional<RendezVous> optionalRendezVous = rendezVousService.getRendezVousById(id);
            if (optionalRendezVous.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            RendezVous rendezVous = optionalRendezVous.get();
            rendezVous.setStatus(status);
            rendezVousService.updateRendezVousStatus(id, status); // Correction : passer status au lieu de rendezVous

            boolean success = true;
            String message;

            if (RendezVous.Status.ACCEPTED.equals(status)) {
                try {
                    googleCalendarService.ajouterRendezVous(rendezVous, authentication); // Passer authentication
                    message = "Rendez-vous approuvé et ajouté avec succès à Google Calendar";
                } catch (Exception e) {
                    success = false;
                    message = "Erreur lors de l’ajout à Google Calendar : " + e.getMessage();
                    return ResponseEntity.status(500).body(new ResponseMessage(message, false));
                }
            } else {
                message = "Statut du rendez-vous mis à jour avec succès";
            }

            return ResponseEntity.ok(new ResponseMessage(message, success));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ResponseMessage("Erreur lors de la mise à jour du statut : " + e.getMessage(), false));
        }

    }*/
    @PatchMapping("/update-status/{id}")
    public ResponseEntity<ResponseMessage> updateRendezVousStatus(@PathVariable Long id, @RequestBody RendezVous.Status status) {
        try {
            Optional<RendezVous> optionalRendezVous = rendezVousService.getRendezVousById(id);
            if (optionalRendezVous.isEmpty()) {
                return ResponseEntity.status(404).body(new ResponseMessage("Rendez-vous non trouvé", false));
            }

            RendezVous rendezVous = optionalRendezVous.get();
            rendezVous.setStatus(status);
            rendezVousService.updateRendezVousStatus(id, status);

            String message = "Statut du rendez-vous mis à jour avec succès";
            boolean success = true;

            if (RendezVous.Status.ACCEPTED.equals(status)) {
                // Désactiver temporairement pour tester sans Google Calendar
                googleCalendarService.ajouterRendezVous(rendezVous);
                message += " (ajout à Google Calendar désactivé)";
            }

            return ResponseEntity.ok(new ResponseMessage(message, success));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ResponseMessage("Erreur: " + e.getMessage(), false));
        }
    }


    // Classe interne pour la réponse JSON
    public static class ResponseMessage {
        private String message;
        private boolean success;

        public ResponseMessage(String message, boolean success) {
            this.message = message;
            this.success = success;
        }

        public String getMessage() {
            return message;
        }

        public boolean isSuccess() {
            return success;
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> createRendezVous(
            @RequestBody RendezVous rendezVous,
            @RequestParam Long coachId,
            @RequestParam Long entrepreneurId
    ) {
        try {
            // Validate input
            if (rendezVous.getTitle() == null || rendezVous.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Title is required"));
            }
            if (rendezVous.getEmail() == null || rendezVous.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Email is required"));
            }
            if (rendezVous.getDate() == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Date is required"));
            }
            if (rendezVous.getHeure() == null || rendezVous.getHeure().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Heure is required"));
            }
            if (rendezVous.getDescription() == null || rendezVous.getDescription().trim().isEmpty() || rendezVous.getDescription().length() > 500) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Description is required and must not exceed 500 characters"));
            }
            if (rendezVous.getStatus() == null) {
                rendezVous.setStatus(RendezVous.Status.PENDING);
            } else if (!rendezVous.getStatus().name().equals("PENDING") &&
                    !rendezVous.getStatus().name().equals("ACCEPTED") &&
                    !rendezVous.getStatus().name().equals("REJECTED")) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Invalid status value"));
            }

            // Fetch the coach and entrepreneur from the database
            Optional<Coach> coach = coachRepository.findById(coachId);
            Optional<Entrepreneur> entrepreneur = entrepreneurRepository.findById(entrepreneurId);

            if (coach.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Coach not found for id: " + coachId));
            }
            if (entrepreneur.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Entrepreneur not found for id: " + entrepreneurId));
            }

            // Set the coach and entrepreneur for the rendezvous
            rendezVous.setCoach(coach.get());
            rendezVous.setEntrepreneur(entrepreneur.get());

            // Check for time conflicts
            List<RendezVous> acceptedAppointments = rendezVousService.getRendezVousByDateAndStatus(rendezVous.getDate(), RendezVous.Status.ACCEPTED);
            java.time.LocalTime newTime = java.time.LocalTime.parse(rendezVous.getHeure());
            int bufferMinutes = 45;

            for (RendezVous existing : acceptedAppointments) {
                java.time.LocalTime existingTime = java.time.LocalTime.parse(existing.getHeure());
                long minutesDiff = java.time.Duration.between(existingTime, newTime).toMinutes();
                if (Math.abs(minutesDiff) < bufferMinutes || minutesDiff == 0) {
                    return ResponseEntity.badRequest().body(new ErrorResponse("Time conflict: Appointment too close to an existing accepted appointment at " + existing.getHeure()));
                }
            }

            // Save the appointment
            RendezVous savedRendezVous = rendezVousService.createRendezVous(rendezVous);
            return ResponseEntity.ok(savedRendezVous);
        } catch (Exception e) {
            logger.error("Erreur lors de la création du rendez-vous : {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new ErrorResponse("Internal server error: " + e.getMessage()));
        }
    }











    // Récupérer les rendez-vous par entrepreneurId
    @GetMapping("/entrepreneur/{entrepreneurId}")
    public ResponseEntity<List<RendezVous>> getRendezVousByEntrepreneurId(@PathVariable Long entrepreneurId) {
        List<RendezVous> rendezVous = rendezVousService.getRendezVousByEntrepreneurId(entrepreneurId);
        return ResponseEntity.ok(rendezVous);

    }





















    // Inner class for error responses
    public static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
    @GetMapping("/all")
    public ResponseEntity<List<RendezVous>> getAllRendezVous() {
        logger.info("Fetching all rendezvous");
        return ResponseEntity.ok(rendezVousService.getAllRendezVous());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RendezVous> getRendezVousById(@PathVariable Long id) {
        logger.info("Fetching rendezvous by ID: {}", id);
        Optional<RendezVous> rendezVous = rendezVousService.getRendezVousById(id);
        return rendezVous.map(ResponseEntity::ok).orElseGet(() -> {
            logger.warn("Rendezvous with ID {} not found", id);
            return ResponseEntity.notFound().build();
        });
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateRendezVous(@PathVariable Long id, @RequestBody RendezVous rendezVous) {
        logger.info("Updating rendezvous with ID: {}", id);

        try {
            // Vérifier si le rendez-vous existe
            RendezVous existingRendezVous = rendezVousService.getRendezVousById(id)
                    .orElseThrow(() -> new RuntimeException("Rendez-vous not found with id: " + id));

            // Si coach ou entrepreneur ne sont pas fournis, réutiliser les existants
            if (rendezVous.getCoach() == null || rendezVous.getCoach().getId() == null) {
                rendezVous.setCoach(existingRendezVous.getCoach());
            }
            if (rendezVous.getEntrepreneur() == null || rendezVous.getEntrepreneur().getId() == null) {
                rendezVous.setEntrepreneur(existingRendezVous.getEntrepreneur());
            }

            // Mettre à jour le rendez-vous
            RendezVous updatedRendezVous = rendezVousService.updateRendezVous(id, rendezVous);
            return ResponseEntity.ok(updatedRendezVous);
        } catch (RuntimeException e) {
            logger.error("Error updating rendezvous with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(404).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error updating rendezvous with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(500).body(new ErrorResponse("Unexpected error: " + e.getMessage()));
        }
    }
    @Operation(summary = "Obtenir les rendez-vous approuvés pour une date spécifique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Liste des rendez-vous approuvés récupérée avec succès"),
            @ApiResponse(responseCode = "204", description = "Aucun rendez-vous trouvé pour cette date"),
            @ApiResponse(responseCode = "400", description = "Format de date invalide"),
            @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    @GetMapping("/accepted")
    public ResponseEntity<List<RendezVous>> getAcceptedAppointmentsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "ACCEPTED") RendezVous.Status status) {
        try {
            logger.info("Fetching accepted appointments for date: {} with status: {}", date, status);
            List<RendezVous> appointments = rendezVousService.getRendezVousByDateAndStatus(date, status);
            if (appointments.isEmpty()) {
                logger.info("No accepted appointments found for date: {}", date);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(appointments);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid date format for date {}: {}", date, e.getMessage(), e);
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            logger.error("Server error fetching appointments for date {} and status {}: {}", date, status, e.getMessage(), e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteRendezVous(@PathVariable Long id) {
        logger.info("Deleting rendezvous ID: {}", id);
        rendezVousService.deleteRendezVous(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/coach/{coachId}")
    public ResponseEntity<List<RendezVous>> getRendezVousByCoach(@PathVariable Long coachId) {
        logger.info("Fetching rendezvous for coach ID: {}", coachId);
        List<RendezVous> rendezVous = rendezVousService.getRendezVousByCoachId(coachId);
        return ResponseEntity.ok(rendezVous);
    }
}