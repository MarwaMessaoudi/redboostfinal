package team.project.redboost.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import team.project.redboost.entities.Role; // Import the Role enum
import team.project.redboost.entities.User;
import team.project.redboost.repositories.UserRepository;

@Service
public class UserService { // No need to implement an interface

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Use the PasswordEncoder interface

    public User addUser(User user) {
        // *** ADD THIS BLOCK TO ASSIGN THE DEFAULT ROLE ***
        // Set the default role here.  Choose the appropriate default.
        user.setRole(Role.USER); // Or Role.CUSTOMER, Role.GUEST, etc.

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
}