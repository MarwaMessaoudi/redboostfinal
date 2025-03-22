package team.project.redboost.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team.project.redboost.entities.Coach;
import team.project.redboost.repositories.CoachRepository;

import java.util.*;
@RestController
@RequestMapping("/api/coachlist")
@Tag(name = "Coach List", description = "API pour la liste dynamique des coachs")
@CrossOrigin(origins = "*")
public class CoachListController {

    @Autowired
    private CoachRepository coachRepository; // Repository to fetch coaches

    // Endpoint to fetch the list of coaches
    @GetMapping
    @Operation(summary = "Récupérer la liste dynamique des coachs")
    public ResponseEntity<List<Coach>> getCoachList() {
        List<Coach> coaches = coachRepository.findAll(); // Fetch all coaches
        return ResponseEntity.ok(coaches);
    }

    // Endpoint to fetch a coach by ID
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un coach par son ID")
    public ResponseEntity<Coach> getCoachById(@PathVariable Long id) {
        Optional<Coach> coach = coachRepository.findById(id);
        return coach.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}