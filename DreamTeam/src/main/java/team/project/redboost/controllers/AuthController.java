package team.project.redboost.controllers;

import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jdbc.core.JdbcAggregateOperations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import team.project.redboost.authentif.JwtUtil;
import team.project.redboost.entities.Coach;
import team.project.redboost.entities.Entrepreneur;
import team.project.redboost.entities.Role;
import team.project.redboost.entities.User;
import team.project.redboost.repositories.CoachRepository;
import team.project.redboost.repositories.EntrepreneurRepository;
import team.project.redboost.services.CustomUserDetailsService;
import team.project.redboost.services.EmailService;
import team.project.redboost.services.FirebaseService;
import team.project.redboost.services.UserService;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/Auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private JwtUtil jwtUtil;


    @Autowired
    private EmailService emailService;

    @Autowired
    private FirebaseService firebaseService;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private UserService userService; // Use UserService directly

    @Autowired
    private CoachRepository coachRepository;

    @Autowired
    private EntrepreneurRepository entrepreneurRepository;




    @Autowired
    public AuthController(FirebaseService firebaseService, UserService userService, JwtUtil jwtUtil) {
        this.firebaseService = firebaseService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }


    @PostMapping("/firebase")
    public ResponseEntity<?> firebaseLogin(@RequestBody Map<String, String> request, HttpServletResponse response) {
        String idToken = request.get("idToken");

        try {
            FirebaseToken decodedToken = firebaseService.verifyIdToken(idToken);
            String email = decodedToken.getEmail();
            String uid = decodedToken.getUid();

            // Check if user exists
            User user = userService.findByEmail(email);
            if (user == null) {
                // Firebase does not provide firstName and lastName, so we use placeholders or leave them null.
                user = new User();
                user.setEmail(email);
                user.setProvider("google");
                user.setProviderId(uid);
                user.setRole(Role.USER);

                // Set default values for firstName and lastName if not available
                user.setFirstName("Unknown"); // Default value
                user.setLastName("Unknown");  // Default value
                user.setPassword("unknown");
                user.setPhoneNumber("Unknown");
                user.setRole(Role.USER);

                try {
                    userService.addUser(user); // Save the new user
                } catch (Exception e) {
                    log.error("Failed to save user: {}", e.getMessage(), e);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                            "message", "Failed to save user",
                            "error", e.getMessage()
                    ));
                }
            }

            // Generate JWT tokens
            final String accessToken = jwtUtil.generateToken(user.getEmail(), user.getAuthorities());
            final String refreshToken = jwtUtil.generateRefreshToken(user.getEmail(), user.getAuthorities());

            // Return the tokens in the response body
            return ResponseEntity.ok(Map.of(
                    "accessToken", accessToken,
                    "refreshToken", refreshToken,
                    "roles", user.getAuthorities().stream()
                            .map(GrantedAuthority::getAuthority)
                            .collect(Collectors.toList()),
                    "user", user
            ));
        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid ID token", "error", e.getMessage()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        log.info("Authenticating user with email: {}", email);

        try {
            // Authenticate user
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));

            // Load user details (which includes authorities/roles)
            final UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            // Fetch user entity from DB
            User user = userService.findByEmail(email);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "message", "User not found with email: " + email,
                        "errorCode", "AUTH008"
                ));
            }

            // Generate JWT token

            final String accessToken = jwtUtil.generateToken(userDetails.getUsername(), userDetails.getAuthorities());
            final String refreshToken = jwtUtil.generateRefreshToken(userDetails.getUsername(), userDetails.getAuthorities());

            // Return the tokens in the response body
            return ResponseEntity.ok(Map.of(
                    "accessToken", accessToken,
                    "refreshToken", refreshToken,
                    "message", "Login successful"
            ));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", e.getMessage(),
                    "errorCode", "AUTH009"
            ));
        }
    }





    // Refresh access token
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshAccessToken(@RequestBody Map<String, String> refreshRequest) {
        String refreshToken = refreshRequest.get("refreshToken");

        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "message", "Refresh token is missing!",
                    "errorCode", "AUTH003"
            ));
        }

        String email = jwtUtil.extractEmail(refreshToken);
        if (!jwtUtil.validateToken(refreshToken, email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "message", "Invalid or expired refresh token!",
                    "errorCode", "AUTH005"
            ));
        }

        // Generate a new access token
        String newAccessToken = jwtUtil.generateToken(email, userDetailsService.loadUserByUsername(email).getAuthorities());

        return ResponseEntity.ok(Map.of(
                "accessToken", newAccessToken,
                "message", "Token refreshed successfully"
        ));
    }




    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> registrationRequest) {
        try {
            String email = registrationRequest.get("email");
            String password = registrationRequest.get("password");
            String firstName = registrationRequest.get("firstName");
            String lastName = registrationRequest.get("lastName");
            String phoneNumber = registrationRequest.get("phoneNumber");
            Role role = Role.valueOf(registrationRequest.get("role"));


            // Validate required fields
            if (email == null || password == null || firstName == null || lastName == null || phoneNumber == null || role == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "message", "All fields are required!",
                        "errorCode", "AUTH010"
                ));
            }

            if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Invalid email format!",
                        "errorCode", "AUTH012"
                ));
            }

            // Check if user already exists
            if (userService.findByEmail(email) != null) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                        "message", "User already exists!",
                        "errorCode", "AUTH011"
                ));
            }

            // Create the user (Coach, Entrepreneur, or User)
            User user;
            if (role == Role.COACH) {
                user = new Coach();
            } else if (role == Role.ENTREPRENEUR) {
                user = new Entrepreneur();
            } else {
                user = new User();
            }

            user.setEmail(email);
            user.setPassword(password); // Hash password before saving
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPhoneNumber(phoneNumber);
            user.setRole(role);

            String confirmationCode = user.generateConfirmationCode();
            user.setConfirm_code(confirmationCode);
            user.setActive(false);
            // Log the confirmation code
            System.out.println("Generated confirmation code: " + confirmationCode);

            User savedUser = userService.addUser(user);
            // Log the saved user's confirmation code
            System.out.println("Saved user confirmation code: " + savedUser.getConfirm_code());
            // If user is a coach, save additional details
            if (role == Role.COACH) {
                Coach coach = new Coach();
                coach.setId(savedUser.getId());
                coach.setEmail(savedUser.getEmail());
                coach.setFirstName(savedUser.getFirstName());
                coach.setLastName(savedUser.getLastName());
                coach.setPhoneNumber(savedUser.getPhoneNumber());
                coach.setRole(savedUser.getRole());
                coach.setConfirm_code(savedUser.getConfirm_code()); // Copy confirm code here!
                coach.setPassword(savedUser.getPassword());
                coachRepository.save(coach);
            }


            // If user is an entrepreneur, save additional details
            if (role == Role.ENTREPRENEUR) {


                Entrepreneur entrepreneur = new Entrepreneur();
                entrepreneur.setId(savedUser.getId());
                entrepreneur.setEmail(savedUser.getEmail());
                entrepreneur.setFirstName(savedUser.getFirstName());
                entrepreneur.setLastName(savedUser.getLastName());
                entrepreneur.setPhoneNumber(savedUser.getPhoneNumber());
                entrepreneur.setRole(savedUser.getRole());
                entrepreneur.setConfirm_code(savedUser.getConfirm_code()); // Copy confirm code here!
                entrepreneur.setPassword(savedUser.getPassword());
                entrepreneurRepository.save(entrepreneur);
            }

            // Send confirmation email
            String subject = "Confirm your email";
            String body = "Hello " + firstName + " " + lastName + ",\n\n" +
                    "Thank you for registering!\n\n" +
                    "Your confirmation code is: " + confirmationCode + "\n\n" +
                    "Best regards,\nRedboost Team";
            emailService.sendEmail(email, subject, body);

            return ResponseEntity.ok(Map.of("message", "Registration successful! A confirmation email has been sent."));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Registration failed",
                    "error", e.getMessage()
            ));
        }
    }






    @PostMapping("/confirm-email")
    public ResponseEntity<?> confirmEmail(@RequestBody Map<String, String> confirmationRequest) {
        try {
            String email = confirmationRequest.get("email");
            String code = confirmationRequest.get("code");

            User user = userService.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "message", "User not found!",
                        "errorCode", "AUTH013"
                ));
            }

            if (user.getConfirm_code().equals(code)) {
                user.setActive(true);
                userService.updateUser(user);
                return ResponseEntity.ok(Map.of("message", "Email confirmed successfully!"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "message", "Invalid confirmation code!",
                        "errorCode", "AUTH014"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Email confirmation failed",
                    "error", e.getMessage()
            ));
        }
    }










}