package team.project.redboost.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import team.project.redboost.entities.Role;
import team.project.redboost.entities.User;
import team.project.redboost.repositories.UserRepository;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService { // No need to implement an interface

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Use the PasswordEncoder interface

    public User addUser(User user) {

        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            // If the user is authenticated via Firebase, do not encode the password
            user.setPassword(null); // or generate a random secure password if needed
        }
        return userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User findByProviderId(String providerId) {
        return userRepository.findByProviderId(providerId);
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }


    public String generatePasswordResetToken(User user) {
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(24)); // Token valid for 24 hours
        userRepository.save(user);
        return token;
    }


    public class InvalidTokenException extends RuntimeException {
        public InvalidTokenException(String message) {
            super(message);
        }
    }

    public User findByResetToken(String token) throws InvalidTokenException {
        Optional<User> userOptional = userRepository.findByResetToken(token);

        if (userOptional.isEmpty()) {
            throw new InvalidTokenException("Invalid reset token");
        }

        User user = userOptional.get();
        if (user.getResetTokenExpiry() == null ||
                user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Reset token has expired");
        }

        return user;
    }

    public void updatePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }



    @Autowired
    private CloudinaryService cloudinaryService;

    public void updateProfilePicture(String email, String imageUrl) {
        // Find the user by email
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Update the profile picture URL
        user.setProfilePictureUrl(imageUrl);
        userRepository.save(user);
    }
    public List<User> getUsersByRoles(List<Role> roles) {
        return userRepository.findByRoleIn(roles);
    }
}