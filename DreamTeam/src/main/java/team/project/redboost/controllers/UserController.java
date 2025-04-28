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
import team.project.redboost.entities.*;
import team.project.redboost.repositories.CoachRepository;
import team.project.redboost.repositories.EntrepreneurRepository;
import team.project.redboost.repositories.InvestorRepository;
import team.project.redboost.repositories.UserRepository;
import team.project.redboost.services.CloudinaryService;
import team.project.redboost.services.CoachService;
import team.project.redboost.services.EmailService;
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
    private InvestorRepository investorRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private CoachService coachService;

    @Autowired
    private CloudinaryService cloudinaryService;

    @PatchMapping("/updateprofile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateUserProfile(
            @RequestBody Map<String, Object> updateRequest,
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }

        Role role = user.getRole();

        // Update common fields
        if (updateRequest.containsKey("firstName")) {
            user.setFirstName((String) updateRequest.get("firstName"));
        }
        if (updateRequest.containsKey("lastName")) {
            user.setLastName((String) updateRequest.get("lastName"));
        }
        if (updateRequest.containsKey("phoneNumber")) {
            user.setPhoneNumber((String) updateRequest.get("phoneNumber"));
        }
        if (updateRequest.containsKey("facebook")) {
            String facebook = (String) updateRequest.get("facebook");
            user.setFacebookUrl(facebook != null && !facebook.isEmpty() ? facebook : null);
        }
        if (updateRequest.containsKey("instagram")) {
            String instagram = (String) updateRequest.get("instagram");
            user.setInstagramUrl(instagram != null && !instagram.isEmpty() ? instagram : null);
        }
        if (updateRequest.containsKey("linkedin")) {
            String linkedin = (String) updateRequest.get("linkedin");
            user.setLinkedinUrl(linkedin != null && !linkedin.isEmpty() ? linkedin : null);
        }
        if (updateRequest.containsKey("bio")) {
            String bio = (String) updateRequest.get("bio");
            user.setBio(bio != null && !bio.isEmpty() ? bio : null);
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
            if (updateRequest.containsKey("skills")) {
                String skills = (String) updateRequest.get("skills");
                coach.setSkills(skills != null && !skills.isEmpty() ? skills : null);
            }
            if (updateRequest.containsKey("expertise")) {
                String expertise = (String) updateRequest.get("expertise");
                coach.setExpertise(expertise != null && !expertise.isEmpty() ? expertise : null);
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

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getLoggedInUserProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "message", "User not found!",
                        "errorCode", "USER001"
                ));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("email", user.getEmail());
            response.put("phoneNumber", user.getPhoneNumber());
            response.put("facebookUrl", user.getFacebookUrl());
            response.put("instagramUrl", user.getInstagramUrl());
            response.put("linkedinUrl", user.getLinkedinUrl());
            response.put("bio", user.getBio());
            response.put("role", user.getRole());
            response.put("isActive", user.isActive());
            response.put("profile_pictureurl", user.getProfilePictureUrl());

            if (user.getRole() == Role.COACH) {
                Coach coach = coachRepository.findById(user.getId()).orElse(null);
                if (coach != null) {
                    response.put("specialization", coach.getSpecialization());
                    response.put("yearsOfExperience", coach.getYearsOfExperience());
                    response.put("skills", coach.getSkills());
                    response.put("expertise", coach.getExpertise());
                }
            } else if (user.getRole() == Role.ENTREPRENEUR) {
                Entrepreneur entrepreneur = entrepreneurRepository.findById(user.getId()).orElse(null);
                if (entrepreneur != null) {
                    response.put("startupName", entrepreneur.getStartupName());
                    response.put("industry", entrepreneur.getIndustry());
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

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String email = userDetails.getUsername();
            String imageUrl = cloudinaryService.uploadImage(file);
            userService.updateProfilePicture(email, imageUrl);
            return ResponseEntity.ok(Map.of("message", "Profile picture updated successfully", "imageUrl", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to upload image", "error", e.getMessage()));
        }
    }

    @PostMapping("/adduser")
    public ResponseEntity<?> addUser(@RequestBody Map<String, String> registrationRequest) {
        try {
            String email = registrationRequest.get("email");
            String password = registrationRequest.get("password");
            String firstName = registrationRequest.get("firstName");
            String lastName = registrationRequest.get("lastName");
            String phoneNumber = registrationRequest.get("phoneNumber");
            String roleStr = registrationRequest.get("role");

            if (email == null || password == null || firstName == null || lastName == null || phoneNumber == null || roleStr == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "message", "All fields are required!",
                        "errorCode", "AUTH010"
                ));
            }

            if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "message", "Invalid email format!",
                        "errorCode", "AUTH012"
                ));
            }

            if (userService.findByEmail(email) != null) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                        "message", "User already exists!",
                        "errorCode", "AUTH011"
                ));
            }

            Role role;
            try {
                role = Role.valueOf(roleStr);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "message", "Invalid role!",
                        "errorCode", "AUTH014"
                ));
            }

            User user;
            if (role == Role.COACH) {
                user = new Coach();
            } else if (role == Role.ENTREPRENEUR) {
                user = new Entrepreneur();
            } else if (role == Role.INVESTOR) {
                user = new Investor();
            } else {
                user = new User();
            }

            user.setEmail(email);
            user.setPassword(password);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPhoneNumber(phoneNumber);
            user.setRole(role);
            user.setActive(true);
            user.setConfirm_code(null);

            User savedUser = userService.addUser(user);

            if (role == Role.COACH) {
                Coach coach = new Coach();
                coach.setId(savedUser.getId());
                coach.setEmail(savedUser.getEmail());
                coach.setFirstName(savedUser.getFirstName());
                coach.setLastName(savedUser.getLastName());
                coach.setPhoneNumber(savedUser.getPhoneNumber());
                coach.setRole(savedUser.getRole());
                coach.setConfirm_code(savedUser.getConfirm_code());
                coach.setPassword(savedUser.getPassword());
                coach.setSkills(registrationRequest.get("skills"));
                coach.setExpertise(registrationRequest.get("expertise"));
                coachRepository.save(coach);
            } else if (role == Role.ENTREPRENEUR) {
                Entrepreneur entrepreneur = new Entrepreneur();
                entrepreneur.setId(savedUser.getId());
                entrepreneur.setEmail(savedUser.getEmail());
                entrepreneur.setFirstName(savedUser.getFirstName());
                entrepreneur.setLastName(savedUser.getLastName());
                entrepreneur.setPhoneNumber(savedUser.getPhoneNumber());
                entrepreneur.setRole(savedUser.getRole());
                entrepreneur.setConfirm_code(savedUser.getConfirm_code());
                entrepreneur.setPassword(savedUser.getPassword());
                entrepreneurRepository.save(entrepreneur);
            } else if (role == Role.INVESTOR) {
                Investor investor = new Investor();
                investor.setId(savedUser.getId());
                investor.setEmail(savedUser.getEmail());
                investor.setFirstName(savedUser.getFirstName());
                investor.setLastName(savedUser.getLastName());
                investor.setPhoneNumber(savedUser.getPhoneNumber());
                investor.setRole(savedUser.getRole());
                investor.setConfirm_code(savedUser.getConfirm_code());
                investor.setPassword(savedUser.getPassword());
                investorRepository.save(investor);
            }

            String loginLink = "http://localhost:4200/login";
            String subject = "Welcome to Redboost! You have been added to our platform";
            String body = String.format(
                    "Hello %s %s,\n\n" +
                            "Welcome to Redboost! You have been added to our platform as a %s.\n\n" +
                            "We are thrilled to have you with us. You can now log in to your account using the following link:\n" +
                            "%s\n\n" +
                            "If you have any questions, feel free to reach out.\n\n" +
                            "Thank you for joining us!\n\n" +
                            "Best regards,\n" +
                            "The Redboost Team",
                    firstName, lastName, role, loginLink
            );

            emailService.sendEmail(email, subject, body);

            return ResponseEntity.ok(Map.of(
                    "message", "User added successfully! A welcome email has been sent."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Failed to add user",
                    "error", e.getMessage()
            ));
        }
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(@RequestParam(required = false) String role) {
        List<User> users;
        if (role != null && !role.isEmpty()) {
            try {
                Role roleEnum = Role.valueOf(role.toUpperCase());
                users = userRepository.findByRole(roleEnum);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }
        } else {
            users = userRepository.findAll();
        }
        return ResponseEntity.ok(users);
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PatchMapping("/update/{id}")
    public ResponseEntity<?> updateUserById(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updateRequest) {
        try {
            for (int attempt = 0; attempt < 3; attempt++) {
                try {
                    User user = userRepository.findById(id).orElse(null);
                    if (user == null) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(Map.of("message", "User not found with ID: " + id));
                    }

                    String userEmail = user.getEmail();
                    Role originalRole = user.getRole();
                    System.out.println("Original Role: " + originalRole);

                    if (updateRequest.containsKey("firstName")) {
                        user.setFirstName((String) updateRequest.get("firstName"));
                    }
                    if (updateRequest.containsKey("lastName")) {
                        user.setLastName((String) updateRequest.get("lastName"));
                    }
                    if (updateRequest.containsKey("phoneNumber")) {
                        user.setPhoneNumber((String) updateRequest.get("phoneNumber"));
                    }
                    if (updateRequest.containsKey("facebook")) {
                        String facebook = (String) updateRequest.get("facebook");
                        user.setFacebookUrl(facebook != null && !facebook.isEmpty() ? facebook : null);
                    }
                    if (updateRequest.containsKey("instagram")) {
                        String instagram = (String) updateRequest.get("instagram");
                        user.setInstagramUrl(instagram != null && !instagram.isEmpty() ? instagram : null);
                    }
                    if (updateRequest.containsKey("linkedin")) {
                        String linkedin = (String) updateRequest.get("linkedin");
                        user.setLinkedinUrl(linkedin != null && !linkedin.isEmpty() ? linkedin : null);
                    }
                    if (updateRequest.containsKey("bio")) {
                        String bio = (String) updateRequest.get("bio");
                        user.setBio(bio != null && !bio.isEmpty() ? bio : null);
                    }
                    if (updateRequest.containsKey("email")) {
                        String newEmail = (String) updateRequest.get("email");
                        if (!newEmail.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(Map.of("message", "Invalid email format", "errorCode", "AUTH012"));
                        }
                        User existingUser = userRepository.findByEmail(newEmail);
                        if (existingUser != null && !existingUser.getId().equals(user.getId())) {
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                                    .body(Map.of("message", "Email already in use", "errorCode", "AUTH011"));
                        }
                        user.setEmail(newEmail);
                        userEmail = newEmail;
                    }

                    Role newRole = null;
                    if (updateRequest.containsKey("role")) {
                        String roleString = (String) updateRequest.get("role");
                        System.out.println("New Role from Request: " + roleString);
                        try {
                            newRole = Role.valueOf(roleString.toUpperCase());
                            user.setRole(newRole);
                        } catch (IllegalArgumentException e) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(Map.of("message", "Invalid role value: " + roleString, "errorCode", "ROLE001"));
                        }
                    }

                    if (newRole != null && !originalRole.equals(newRole)) {
                        System.out.println("Role changed from " + originalRole + " to " + newRole);
                        if (originalRole == Role.COACH) {
                            coachRepository.deleteById(user.getId());
                            System.out.println("Deleted Coach record for user ID: " + user.getId());
                        } else if (originalRole == Role.ENTREPRENEUR) {
                            entrepreneurRepository.deleteById(user.getId());
                            System.out.println("Deleted Entrepreneur record for user ID: " + user.getId());
                        } else if (originalRole == Role.INVESTOR) {
                            investorRepository.deleteById(user.getId());
                            System.out.println("Deleted Investor record for user ID: " + user.getId());
                        }

                        if (newRole == Role.COACH) {
                            Coach newCoach = new Coach();
                            newCoach.setId(user.getId());
                            newCoach.setEmail(user.getEmail());
                            newCoach.setFirstName(user.getFirstName());
                            newCoach.setLastName(user.getLastName());
                            newCoach.setPhoneNumber(user.getPhoneNumber());
                            newCoach.setRole(newRole);
                            newCoach.setPassword(user.getPassword());
                            newCoach.setSkills((String) updateRequest.get("skills"));
                            newCoach.setExpertise((String) updateRequest.get("expertise"));
                            coachRepository.save(newCoach);
                            System.out.println("Created new Coach record for user ID: " + user.getId());
                        } else if (newRole == Role.ENTREPRENEUR) {
                            Entrepreneur newEntrepreneur = new Entrepreneur();
                            newEntrepreneur.setId(user.getId());
                            newEntrepreneur.setEmail(user.getEmail());
                            newEntrepreneur.setFirstName(user.getFirstName());
                            newEntrepreneur.setLastName(user.getLastName());
                            newEntrepreneur.setPhoneNumber(user.getPhoneNumber());
                            newEntrepreneur.setRole(newRole);
                            newEntrepreneur.setPassword(user.getPassword());
                            entrepreneurRepository.save(newEntrepreneur);
                            System.out.println("Created new Entrepreneur record for user ID: " + user.getId());
                        } else if (newRole == Role.INVESTOR) {
                            Investor newInvestor = new Investor();
                            newInvestor.setId(user.getId());
                            newInvestor.setEmail(user.getEmail());
                            newInvestor.setFirstName(user.getFirstName());
                            newInvestor.setLastName(user.getLastName());
                            newInvestor.setPhoneNumber(user.getPhoneNumber());
                            newInvestor.setRole(newRole);
                            newInvestor.setPassword(user.getPassword());
                            investorRepository.save(newInvestor);
                            System.out.println("Created new Investor record for user ID: " + user.getId());
                        }
                    } else {
                        if (originalRole == Role.COACH) {
                            Coach coach = coachRepository.findById(user.getId()).orElse(null);
                            if (coach == null) {
                                coach = new Coach();
                                coach.setId(user.getId());
                                coach.setEmail(user.getEmail());
                                coach.setFirstName(user.getFirstName());
                                coach.setLastName(user.getLastName());
                                coach.setPhoneNumber(user.getPhoneNumber());
                                coach.setRole(user.getRole());
                                coach.setPassword(user.getPassword());
                            } else {
                                coach.setEmail(user.getEmail());
                                coach.setFirstName(user.getFirstName());
                                coach.setLastName(user.getLastName());
                                coach.setPhoneNumber(user.getPhoneNumber());
                            }

                            if (updateRequest.containsKey("specialization")) {
                                coach.setSpecialization((String) updateRequest.get("specialization"));
                            }
                            if (updateRequest.containsKey("yearsOfExperience")) {
                                coach.setYearsOfExperience((Integer) updateRequest.get("yearsOfExperience"));
                            }
                            if (updateRequest.containsKey("skills")) {
                                String skills = (String) updateRequest.get("skills");
                                coach.setSkills(skills != null && !skills.isEmpty() ? skills : null);
                            }
                            if (updateRequest.containsKey("expertise")) {
                                String expertise = (String) updateRequest.get("expertise");
                                coach.setExpertise(expertise != null && !expertise.isEmpty() ? expertise : null);
                            }
                            coachRepository.save(coach);
                            System.out.println("Updated Coach record for user ID: " + user.getId());
                        } else if (originalRole == Role.ENTREPRENEUR) {
                            Entrepreneur entrepreneur = entrepreneurRepository.findById(user.getId()).orElse(null);
                            if (entrepreneur == null) {
                                entrepreneur = new Entrepreneur();
                                entrepreneur.setId(user.getId());
                                entrepreneur.setEmail(user.getEmail());
                                entrepreneur.setFirstName(user.getFirstName());
                                entrepreneur.setLastName(user.getLastName());
                                entrepreneur.setPhoneNumber(user.getPhoneNumber());
                                entrepreneur.setRole(user.getRole());
                                entrepreneur.setPassword(user.getPassword());
                            } else {
                                entrepreneur.setEmail(user.getEmail());
                                entrepreneur.setFirstName(user.getFirstName());
                                entrepreneur.setLastName(user.getLastName());
                                entrepreneur.setPhoneNumber(user.getPhoneNumber());
                            }

                            if (updateRequest.containsKey("startupName")) {
                                entrepreneur.setStartupName((String) updateRequest.get("startupName"));
                            }
                            if (updateRequest.containsKey("industry")) {
                                entrepreneur.setIndustry((String) updateRequest.get("industry"));
                            }
                            entrepreneurRepository.save(entrepreneur);
                            System.out.println("Updated Entrepreneur record for user ID: " + user.getId());
                        }
                    }

                    userRepository.save(user);

                    String subject = "Votre profil a été modifié - Redboost";
                    String body = String.format(
                            "Bonjour %s %s,\n\n" +
                                    "Votre profil sur Redboost a été modifié par un administrateur.\n\n" +
                                    "Détails mis à jour :\n" +
                                    "- Prénom : %s\n" +
                                    "- Nom : %s\n" +
                                    "- Email : %s\n" +
                                    "- Numéro de téléphone : %s\n" +
                                    "- Rôle : %s\n\n" +
                                    "Si vous n'avez pas demandé cette modification, veuillez contacter notre support immédiatement.\n\n" +
                                    "Cordialement,\n" +
                                    "L'équipe Redboost",
                            user.getFirstName(), user.getLastName(),
                            user.getFirstName(), user.getLastName(),
                            user.getEmail(), user.getPhoneNumber(), user.getRole()
                    );

                    emailService.sendEmail(userEmail, subject, body);

                    return ResponseEntity.ok(Map.of("message", "User updated successfully, notification email sent."));
                } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {
                    if (attempt == 2) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(Map.of("message", "The user was modified by another transaction. Please try again.", "errorCode", "CONFLICT001"));
                    }
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "The user was modified by another transaction. Please try again.", "errorCode", "CONFLICT001"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update user", "error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/ByRoles")
    public ResponseEntity<List<User>> getFilteredUsers() {
        List<Role> roles = Arrays.asList(Role.ADMIN, Role.SUPERADMIN, Role.EMPLOYEE);
        List<User> users = userService.getUsersByRoles(roles);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/role-specific")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUsersByRoles() {
        try {
            List<Role> targetRoles = Arrays.asList(Role.ENTREPRENEUR, Role.COACH, Role.INVESTOR);
            List<User> users = userRepository.findByRoleIn(targetRoles);
            if (users.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "message", "No users found with roles ENTREPRENEUR, COACH, or INVESTOR"
                ));
            }

            List<Map<String, Object>> response = users.stream().map(user -> {
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", user.getId());
                userData.put("firstName", user.getFirstName());
                userData.put("lastName", user.getLastName());
                userData.put("email", user.getEmail());
                userData.put("phoneNumber", user.getPhoneNumber());
                userData.put("facebookUrl", user.getFacebookUrl());
                userData.put("instagramUrl", user.getInstagramUrl());
                userData.put("linkedinUrl", user.getLinkedinUrl());
                userData.put("bio", user.getBio());
                userData.put("role", user.getRole());
                userData.put("isActive", user.isActive());
                userData.put("profile_pictureurl", user.getProfilePictureUrl());

                if (user.getRole() == Role.COACH) {
                    Coach coach = coachRepository.findById(user.getId()).orElse(null);
                    if (coach != null) {
                        userData.put("specialization", coach.getSpecialization());
                        userData.put("yearsOfExperience", coach.getYearsOfExperience());
                        userData.put("skills", coach.getSkills());
                        userData.put("expertise", coach.getExpertise());
                    }
                } else if (user.getRole() == Role.ENTREPRENEUR) {
                    Entrepreneur entrepreneur = entrepreneurRepository.findById(user.getId()).orElse(null);
                    if (entrepreneur != null) {
                        userData.put("StartupName", entrepreneur.getStartupName());
                        userData.put("Industry", entrepreneur.getIndustry());
                    }
                } else if (user.getRole() == Role.INVESTOR) {
                    // Add Investor-specific fields if applicable
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

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
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
            response.put("facebookUrl", user.getFacebookUrl());
            response.put("instagramUrl", user.getInstagramUrl());
            response.put("linkedinUrl", user.getLinkedinUrl());
            response.put("bio", user.getBio());
            response.put("role", user.getRole());
            response.put("isActive", user.isActive());
            response.put("profile_pictureurl", user.getProfilePictureUrl());

            if (user.getRole() == Role.COACH) {
                Coach coach = coachRepository.findById(user.getId()).orElse(null);
                if (coach != null) {
                    response.put("specialization", coach.getSpecialization());
                    response.put("yearsOfExperience", coach.getYearsOfExperience());
                    response.put("skills", coach.getSkills());
                    response.put("expertise", coach.getExpertise());
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