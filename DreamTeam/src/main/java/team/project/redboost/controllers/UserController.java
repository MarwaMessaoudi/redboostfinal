package team.project.redboost.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import team.project.redboost.entities.Coach;
import team.project.redboost.entities.Entrepreneur;
import team.project.redboost.entities.User;
import team.project.redboost.repositories.CoachRepository;
import team.project.redboost.repositories.EntrepreneurRepository;
import team.project.redboost.repositories.UserRepository;
import team.project.redboost.entities.Role;
import team.project.redboost.services.UserService;

import java.util.Map;

@RestController
@RequestMapping("/users")

public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CoachRepository coachRepository;

    @Autowired
    private EntrepreneurRepository entrepreneurRepository;
    @Autowired
    private UserService userService;

    @PatchMapping("/updateprofile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateUserProfile(
            @RequestBody Map<String, Object> updateRequest,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Extract email from authenticated user
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }


        Role role = user.getRole();

        // Update common fields (if provided)
        if (updateRequest.containsKey("firstName")) {
            user.setFirstName((String) updateRequest.get("firstName"));
        }
        if (updateRequest.containsKey("lastName")) {
            user.setLastName((String) updateRequest.get("lastName"));
        }
        if (updateRequest.containsKey("phoneNumber")) {
            user.setPhoneNumber((String) updateRequest.get("phoneNumber"));
        }

        // Role-specific updates
        if (role == Role.COACH) {
            Coach coach = coachRepository.findById(user.getId())
                    .orElseThrow(() -> new RuntimeException("Coach details not found"));

            if (updateRequest.containsKey("specialization")) {
                coach.setSpecialization((String) updateRequest.get("specialization"));
            }
            if (updateRequest.containsKey("yearsOfExperience")) {
                coach.setYearsOfExperience((Integer) updateRequest.get("yearsOfExperience"));
            }

            coachRepository.save(coach);

        } else if (role == Role.ENTREPRENEUR) {
            Entrepreneur entrepreneur = entrepreneurRepository.findById(user.getId())
                    .orElseThrow(() -> new RuntimeException("Entrepreneur details not found"));

            if (updateRequest.containsKey("startupName")) {
                entrepreneur.setStartupName((String) updateRequest.get("startupName"));
            }
            if (updateRequest.containsKey("industry")) {
                entrepreneur.setIndustry((String) updateRequest.get("industry"));
            }

            entrepreneurRepository.save(entrepreneur);
        }

        // Save the updated user
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }


    @GetMapping("/profile")
    public ResponseEntity<User> getCurrentUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        // Fetch the user profile based on the authenticated user's details
        User userProfile = userService.findByEmail(userDetails.getUsername());
        return ResponseEntity.ok(userProfile);

    }





}


