package team.project.redboost.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import team.project.redboost.entities.Coach;
import team.project.redboost.entities.Entrepreneur;
import team.project.redboost.entities.User;
import team.project.redboost.repositories.CoachRepository;
import team.project.redboost.repositories.EntrepreneurRepository;
import team.project.redboost.repositories.UserRepository;
import team.project.redboost.entities.Role;
import team.project.redboost.services.CloudinaryService;
import team.project.redboost.services.UserService;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

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
        if (updateRequest.containsKey("linkedin")) {
            user.setPhoneNumber((String) updateRequest.get("linkedin"));
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
    public ResponseEntity<?> getLoggedInUserProfile(Authentication authentication) {
        try {
            // Get the email of the logged-in user from the authentication object
            String email = authentication.getName();

            // Fetch the user from the database
            User user = userService.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "message", "User not found!",
                        "errorCode", "USER001"
                ));
            }

            // Create a response map to hold the user's details
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("email", user.getEmail());
            response.put("phoneNumber", user.getPhoneNumber());
            response.put("role", user.getRole());
            response.put("isActive", user.getisActive());
            response.put("profile_pictureurl", user.getProfilePictureUrl());

            // Fetch additional details based on the user's role
            if (user.getRole() == Role.COACH) {
                Coach coach = coachRepository.findById(user.getId()).orElse(null);
                if (coach != null) {
                    response.put("specialization", coach.getSpecialization());
                    response.put("yearsOfExperience", coach.getYearsOfExperience());
                }
            } else if (user.getRole() == Role.ENTREPRENEUR) {
                Entrepreneur entrepreneur = entrepreneurRepository.findById(user.getId()).orElse(null);
                if (entrepreneur != null) {
                    // Add any additional fields specific to Entrepreneur
                    response.put("StartupName", entrepreneur.getStartupName());
                    response.put("Industry", entrepreneur.getIndustry()); // Example field

                }
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Failed to fetch user profile",
                    "error", e.getMessage()
            ));
        }
    }


    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) { // Get the logged-in user
        try {
            // Get the email of the logged-in user
            String email = userDetails.getUsername();

            // Upload the image to Cloudinary
            String imageUrl = cloudinaryService.uploadImage(file);

            // Update the user's profile picture URL
            userService.updateProfilePicture(email, imageUrl);

            return ResponseEntity.ok(Map.of("message", "Profile picture updated successfully", "imageUrl", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to upload image", "error", e.getMessage()));
        }
    }










    // New endpoint: Get all users with roles ENTREPRENEUR, COACH, or INVESTOR
    @GetMapping("/role-specific")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUsersByRoles() {
        try {
            // Define the roles to filter
            List<Role> targetRoles = Arrays.asList(Role.ENTREPRENEUR, Role.COACH, Role.INVESTOR);

            // Fetch users with the specified roles
            List<User> users = userRepository.findByRoleIn(targetRoles);
            if (users.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "message", "No users found with roles ENTREPRENEUR, COACH, or INVESTOR"
                ));
            }

            // Map users to response format
            List<Map<String, Object>> response = users.stream().map(user -> {
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", user.getId());
                userData.put("firstName", user.getFirstName());
                userData.put("lastName", user.getLastName());
                userData.put("email", user.getEmail());
                userData.put("phoneNumber", user.getPhoneNumber());
                userData.put("role", user.getRole());
                userData.put("isActive", user.getisActive());
                userData.put("profile_pictureurl", user.getProfilePictureUrl());

                // Add role-specific fields
                if (user.getRole() == Role.COACH) {
                    Coach coach = coachRepository.findById(user.getId()).orElse(null);
                    if (coach != null) {
                        userData.put("specialization", coach.getSpecialization());
                        userData.put("yearsOfExperience", coach.getYearsOfExperience());
                    }
                } else if (user.getRole() == Role.ENTREPRENEUR) {
                    Entrepreneur entrepreneur = entrepreneurRepository.findById(user.getId()).orElse(null);
                    if (entrepreneur != null) {
                        userData.put("StartupName", entrepreneur.getStartupName());
                        userData.put("Industry", entrepreneur.getIndustry());
                    }
                } else if (user.getRole() == Role.INVESTOR) {
                    // Add Investor-specific fields if applicable (assuming no InvestorRepository yet)
                    // For now, no additional fields
                }

                return userData;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Failed to fetch users",
                    "error", e.getMessage()
            ));
        }
    }

    // New endpoint: Get user by ID
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            // Fetch the user by ID
            Optional<User> userOptional = userRepository.findById(id);
            if (!userOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "message", "User not found with ID: " + id,
                        "errorCode", "USER002"
                ));
            }

            User user = userOptional.get();
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("email", user.getEmail());
            response.put("phoneNumber", user.getPhoneNumber());
            response.put("role", user.getRole());
            response.put("isActive", user.getisActive());
            response.put("profile_pictureurl", user.getProfilePictureUrl());

            // Add role-specific fields
            if (user.getRole() == Role.COACH) {
                Coach coach = coachRepository.findById(user.getId()).orElse(null);
                if (coach != null) {
                    response.put("specialization", coach.getSpecialization());
                    response.put("yearsOfExperience", coach.getYearsOfExperience());
                }
            } else if (user.getRole() == Role.ENTREPRENEUR) {
                Entrepreneur entrepreneur = entrepreneurRepository.findById(user.getId()).orElse(null);
                if (entrepreneur != null) {
                    response.put("StartupName", entrepreneur.getStartupName());
                    response.put("Industry", entrepreneur.getIndustry());
                }
            } else if (user.getRole() == Role.INVESTOR) {
                // Add Investor-specific fields if applicable
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Failed to fetch user",
                    "error", e.getMessage()
            ));
        }
    }
}














