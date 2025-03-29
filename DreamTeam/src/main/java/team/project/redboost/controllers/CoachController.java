package team.project.redboost.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import team.project.redboost.entities.CoachRequest;
import team.project.redboost.services.CoachService;

import java.util.List;

@RestController
@RequestMapping("/api/coach")
public class CoachController {

    @Autowired
    private CoachService coachService;

    // Submit a coach request (accepts full CoachRequest object)
    @PostMapping("/request")
    public ResponseEntity<CoachRequest> submitCoachRequest(@RequestBody CoachRequest request) {
        CoachRequest savedRequest = coachService.submitCoachRequest(request);
        return ResponseEntity.ok(savedRequest);
    }

    // Approve a coach request (SuperAdmin only)
    @PutMapping("/approve/{requestId}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<String> approveCoachRequest(@PathVariable Long requestId) {
        coachService.approveCoachRequest(requestId);
        return ResponseEntity.ok("Coach request approved successfully");
    }

    // Get all coach requests (SuperAdmin only)
    @GetMapping("/requests")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<List<CoachRequest>> getAllCoachRequests() {
        List<CoachRequest> requests = coachService.getAllCoachRequests();
        return ResponseEntity.ok(requests);
    }

    // Reject a coach request (SuperAdmin only)
    @PutMapping("/reject/{requestId}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<String> rejectCoachRequest(@PathVariable Long requestId) {
        coachService.rejectCoachRequest(requestId);
        return ResponseEntity.ok("Coach request rejected successfully");
    }
}