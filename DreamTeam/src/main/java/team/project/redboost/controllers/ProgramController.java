package team.project.redboost.controllers;

import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import team.project.redboost.entities.Program;
import team.project.redboost.entities.User;
import team.project.redboost.repositories.UserRepository;
import team.project.redboost.services.EmailService;
import team.project.redboost.services.ProgramService;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/programs")
@RequiredArgsConstructor
public class ProgramController {

    private final ProgramService programService;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addProgram(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam Double budget,
            @RequestParam Long programLeadId,
            @RequestParam(required = false) MultipartFile logo
    ) throws IOException {
        try {
            User lead = userRepository.findById(programLeadId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

            Program program = programService.createProgram(name, description, startDate, endDate, budget, logo, lead);

            String message = """
                    Bonjour %s,

                    Vous avez été désigné responsable du programme suivant : %s

                    Dates : %s → %s
                    Budget : %.2f €

                    Veuillez vous connecter à la plateforme pour consulter les détails.
                    """.formatted(lead.getFirstName(), name, startDate, endDate, budget);

            emailService.sendEmail(lead.getEmail(), "✅ Nouveau programme assigné", message);

            return ResponseEntity.ok(program);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l’ajout du programme : " + e.getMessage());
        }
    }

    @GetMapping
    public List<Program> getAllPrograms() {
        return programService.getAllProgramsRaw();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Program> getProgramById(@PathVariable Long id) {
        return ResponseEntity.ok(programService.getProgramByIdRaw(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Program>> searchPrograms(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "asc") String sort,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(programService.searchProgramsRaw(name, status, sort, startDate, endDate));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProgram(@PathVariable Long id) {
        programService.deleteProgramById(id);
        return ResponseEntity.ok().build();
    }
    @PutMapping("/{id}")
    public ResponseEntity<Program> updateProgram(
            @PathVariable Long id,
            @RequestBody Program updatedProgram
    ) {
        Program existing = programService.getProgramByIdRaw(id);
        existing.setName(updatedProgram.getName());
        existing.setDescription(updatedProgram.getDescription());
        existing.setStartDate(updatedProgram.getStartDate());
        existing.setEndDate(updatedProgram.getEndDate());
        existing.setBudget(updatedProgram.getBudget());
        existing.setStatus(updatedProgram.getStatus());

        return ResponseEntity.ok(programService.save(existing));
    }



}
