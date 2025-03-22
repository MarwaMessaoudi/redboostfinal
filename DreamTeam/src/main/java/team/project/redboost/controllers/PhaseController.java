package team.project.redboost.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import team.project.redboost.entities.Phase;
import team.project.redboost.services.PhaseService;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/phases")
@CrossOrigin(origins = "http://localhost:4200") // Angular
public class PhaseController {

    @Autowired
    private PhaseService phaseService;

    // Create a new phase
    @PostMapping("/")
    public Phase createPhase(@RequestBody Phase phase) {
        return phaseService.createPhase(phase);
    }

    // Get all phases
    @GetMapping
    public List<Phase> getAllPhases() {
        return phaseService.getAllPhases();
    }

    // Get a phase by ID (with tasks included)
    @GetMapping("/{phaseId}")
    public Phase getPhaseById(@PathVariable Long phaseId) {
        return phaseService.getPhaseById(phaseId);
    }

    // Update a phase
    @PutMapping("/{phaseId}")
    public Phase updatePhase(@PathVariable Long phaseId, @RequestBody Phase updatedPhase) {
        return phaseService.updatePhase(phaseId, updatedPhase);
    }

    // Delete a phase
    @DeleteMapping("/{phaseId}")
    public void deletePhase(@PathVariable Long phaseId) {
        phaseService.deletePhase(phaseId);
    }

    // Get phases within a date range
    @GetMapping("/date-range")
    public List<Phase> getPhasesByDateRange(
            @RequestParam("start") String start,
            @RequestParam("end") String end) {

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // Convert the strings to LocalDate
        LocalDate startDate = LocalDate.parse(start, formatter);
        LocalDate endDate = LocalDate.parse(end, formatter);

        return phaseService.getPhasesByDateRange(startDate, endDate);
    }

    // New endpoint to fetch entrepreneurs grouped by project ID
    @GetMapping("/entrepreneurs/{projetId}")
    public List<Map<String, Object>> getEntrepreneursByProject(@PathVariable Long projetId) {
        return phaseService.getEntrepreneursByProject(projetId);
    }
}
