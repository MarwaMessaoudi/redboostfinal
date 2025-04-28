package team.project.redboost.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import team.project.redboost.entities.Coach;
import team.project.redboost.entities.CoachRequest;
import team.project.redboost.entities.RequestStatus;
import team.project.redboost.entities.Role;
import team.project.redboost.repositories.CoachRepository;
import team.project.redboost.repositories.CoachRequestRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CoachService {

    @Autowired
    private CoachRequestRepository coachRequestRepository;

    @Autowired
    private CoachRepository coachRepository;

    public CoachRequest submitCoachRequest(CoachRequest request) {
        if (coachRequestRepository.existsByEmailAndStatus(request.getEmail(), RequestStatus.PENDING)) {
            throw new IllegalStateException("A pending coach request already exists for this email.");
        }

        if (request.getSpecialization() == null) {
            request.setSpecialization("Unknown");
        }
        if (request.getYearsOfExperience() == null) {
            request.setYearsOfExperience(0);
        }
        if (request.getSkills() == null) {
            request.setSkills(null);
        }
        if (request.getExpertise() == null) {
            request.setExpertise(null);
        }

        request.setStatus(RequestStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());
        return coachRequestRepository.save(request);
    }

    public void approveCoachRequest(Long requestId) {
        CoachRequest request = coachRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Coach request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Request is already processed.");
        }

        Coach coach = new Coach();
        coach.setFirstName(request.getFirstName());
        coach.setLastName(request.getLastName());
        coach.setEmail(request.getEmail());
        coach.setPhoneNumber(request.getPhoneNumber());
        coach.setRole(Role.COACH);
        coach.setActive(true);
        coach.setSpecialization(request.getSpecialization());
        coach.setYearsOfExperience(request.getYearsOfExperience());
        coach.setSkills(request.getSkills());
        coach.setExpertise(request.getExpertise());

        coachRepository.save(coach);
        coachRequestRepository.delete(request);
    }

    public void rejectCoachRequest(Long requestId) {
        CoachRequest request = coachRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Coach request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Request is already processed.");
        }

        request.setStatus(RequestStatus.REJECTED);
        coachRequestRepository.save(request);
    }

    public List<CoachRequest> getAllCoachRequests() {
        return coachRequestRepository.findAll();
    }

    public Coach updateCoachProfile(Long coachId, Coach coachData) {
        Coach coach = coachRepository.findById(coachId)
                .orElseThrow(() -> new IllegalArgumentException("Coach not found"));

        if (coachData.getSpecialization() != null) {
            coach.setSpecialization(coachData.getSpecialization());
        }
        if (coachData.getYearsOfExperience() != null) {
            coach.setYearsOfExperience(coachData.getYearsOfExperience());
        }
        if (coachData.getSkills() != null) {
            coach.setSkills(coachData.getSkills());
        }
        if (coachData.getExpertise() != null) {
            coach.setExpertise(coachData.getExpertise());
        }

        return coachRepository.save(coach);
    }
}