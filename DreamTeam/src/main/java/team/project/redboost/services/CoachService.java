package team.project.redboost.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import team.project.redboost.entities.Coach;
import team.project.redboost.entities.CoachRequest;
import team.project.redboost.entities.RequestStatus;
import team.project.redboost.entities.Role;
import team.project.redboost.repositories.CoachRepository; // Add this
import team.project.redboost.repositories.CoachRequestRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CoachService {

    @Autowired
    private CoachRequestRepository coachRequestRepository;

    @Autowired
    private CoachRepository coachRepository; // Replace UserRepository with CoachRepository

    // Submit a coach request (unchanged)
    public CoachRequest submitCoachRequest(CoachRequest request) {
        if (coachRequestRepository.existsByEmailAndStatus(request.getEmail(), RequestStatus.PENDING)) {
            throw new IllegalStateException("A pending coach request already exists for this email.");
        }

        request.setStatus(RequestStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());
        return coachRequestRepository.save(request);
    }

    // Approve a coach request (SuperAdmin only)
    public void approveCoachRequest(Long requestId) {
        CoachRequest request = coachRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Coach request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Request is already processed.");
        }

        // Create Coach entity (no separate User entity)
        Coach coach = new Coach();
        coach.setFirstName(request.getFirstName());
        coach.setLastName(request.getLastName());
        coach.setEmail(request.getEmail());
        coach.setPhoneNumber(request.getPhoneNumber());
        coach.setLinkedin(request.getLinkedin());
        coach.setRole(Role.COACH); // Set role to COACH
        coach.setActive(true); // Assuming the user should be active
        coach.setSpecialization(request.getSpecialization());
        coach.setYearsOfExperience(request.getYearsOfExperience());

        coachRepository.save(coach); // Save Coach entity, which populates both tables


        // Delete the request from pending_coach_requests instead of updating status
        coachRequestRepository.delete(request);
        // Update request status
       // request.setStatus(RequestStatus.APPROVED);
      //  coachRequestRepository.save(request);
    }

    // Reject a coach request (unchanged)
    public void rejectCoachRequest(Long requestId) {
        CoachRequest request = coachRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Coach request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Request is already processed.");
        }

        request.setStatus(RequestStatus.REJECTED);
        coachRequestRepository.save(request);
    }

    // Get all coach requests
    public List<CoachRequest> getAllCoachRequests() {
        return coachRequestRepository.findAll();
    }
}