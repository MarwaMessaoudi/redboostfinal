package team.project.redboost.services;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import team.project.redboost.entities.Projet;
import team.project.redboost.entities.Role;
import team.project.redboost.entities.User;
import team.project.redboost.repositories.ProjetRepository;
import team.project.redboost.repositories.UserRepository;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class ProjetService {
    private final ProjetRepository projetRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Autowired
    public ProjetService(ProjetRepository projetRepository, UserRepository userRepository, NotificationService notificationService) {
        this.projetRepository = projetRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Projet createProjet(Projet projet, String imageUrl, Long creatorId) {
        if (projetRepository.existsByNameIgnoreCase(projet.getName())) {
            throw new IllegalArgumentException("A project with the name '" + projet.getName() + "' already exists. Please join it or use a different name.");
        }

        if (imageUrl != null && !imageUrl.isEmpty()) {
            projet.setLogoUrl(imageUrl);
        }
        if (projet.getGlobalScore() == null) projet.setGlobalScore(0.0);
        if (projet.getLastUpdated() == null) projet.setLastUpdated(LocalDate.now());
        if (projet.getLastEvaluationDate() == null) projet.setLastEvaluationDate(LocalDate.now());

        User founder = userRepository.findById(creatorId)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + creatorId));
        if (founder.getRole() != Role.ENTREPRENEUR) {
            throw new IllegalArgumentException("User with ID " + creatorId + " is not an Entrepreneur");
        }
        projet.setFounder(founder);
        projet.getEntrepreneurs().add(founder);

        return projetRepository.save(projet);
    }

    public Projet updateProjet(Long id, Projet updatedProjet, String imageUrl) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Projet non trouvé avec l'ID : " + id));

        if (imageUrl != null && !imageUrl.isEmpty() && projet.getLogoUrl() != null) {
            try {
                Files.deleteIfExists(Paths.get(projet.getLogoUrl().substring(1)));
            } catch (Exception e) {
                System.err.println("Failed to delete old logo file: " + e.getMessage());
            }
        }

        projet.setName(updatedProjet.getName());
        projet.setDescription(updatedProjet.getDescription());
        if (imageUrl != null && !imageUrl.isEmpty()) {
            projet.setLogoUrl(imageUrl);
        }
        projet.setLastUpdated(LocalDate.now());
        return projetRepository.save(projet);
    }

    public List<Projet> getAllProjets() {
        return projetRepository.findAllWithPendingCollaborator();
    }

    public Projet getProjetById(Long id) {
        return projetRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Projet non trouvé avec l'ID : " + id));
    }

    @Transactional
    public void deleteProjet(Long id) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Projet non trouvé avec l'ID : " + id));

        if (projet.getLogoUrl() != null) {
            try {
                Files.deleteIfExists(Paths.get(projet.getLogoUrl().substring(1)));
            } catch (Exception e) {
                System.err.println("Failed to delete logo file: " + e.getMessage());
            }
        }

        projetRepository.delete(projet);
    }

    public List<Object[]> getProjetCardByUserId(Long userId) {
        return projetRepository.findProjetCardByUserId(userId);
    }

    @Transactional
    public Projet inviteCollaborator(Long projetId, Long userId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new NoSuchElementException("Projet not found with ID: " + projetId));
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(currentUserEmail);
        if (currentUser == null) {
            throw new IllegalArgumentException("Authenticated user not found with email: " + currentUserEmail);
        }
        User founder = projet.getFounder();
        if (founder == null || !founder.getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Only the project founder can invite a collaborator");
        }

        User collaborator = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + userId));
        if (collaborator.getRole() != Role.ENTREPRENEUR) {
            throw new IllegalArgumentException("User with ID " + userId + " is not an Entrepreneur");
        }

        projet.setPendingCollaborator(collaborator);
        Projet updatedProjet = projetRepository.save(projet);

        String message = "You’ve been invited to collaborate on '" + projet.getName() + "' by " + founder.getFirstName();
        System.out.println("Invite saved and notification about to be sent at: " + java.time.Instant.now() + " for user: " + userId);
        notificationService.notifyUser(collaborator.getId().toString(), message);

        return updatedProjet;
    }

    @Transactional
    public Projet acceptInvitation(Long projetId, Long userId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new NoSuchElementException("Projet not found with ID: " + projetId));
        User collaborator = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + userId));
        User currentUser = getCurrentUser();
        if (!currentUser.getId().equals(userId)) {
            throw new IllegalArgumentException("You can only accept invitations for yourself");
        }
        if (projet.getPendingCollaborator() == null || !projet.getPendingCollaborator().getId().equals(userId)) {
            throw new IllegalArgumentException("No pending invitation for this user");
        }
        projet.getEntrepreneurs().add(collaborator);
        projet.setPendingCollaborator(null);
        return projetRepository.save(projet);
    }

    @Transactional
    public Projet declineInvitation(Long projetId, Long userId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new NoSuchElementException("Projet not found with ID: " + projetId));
        User currentUser = getCurrentUser();
        if (!currentUser.getId().equals(userId)) {
            throw new IllegalArgumentException("You can only decline invitations for yourself");
        }
        if (projet.getPendingCollaborator() != null && projet.getPendingCollaborator().getId().equals(userId)) {
            projet.setPendingCollaborator(null);
        } else {
            throw new IllegalArgumentException("No pending invitation for this user");
        }
        return projetRepository.save(projet);
    }

    public Projet addEntrepreneurToProjet(Long projetId, Long userId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new NoSuchElementException("Projet not found with ID: " + projetId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + userId));
        if (user.getRole() != Role.ENTREPRENEUR) {
            throw new IllegalArgumentException("User with ID " + userId + " is not an Entrepreneur");
        }
        projet.getEntrepreneurs().add(user);
        return projetRepository.save(projet);
    }

    public Projet addCoachToProjet(Long projetId, Long userId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new NoSuchElementException("Projet not found with ID: " + projetId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + userId));
        projet.getCoaches().add(user);
        return projetRepository.save(projet);
    }

    public Projet addInvestorToProjet(Long projetId, Long userId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new NoSuchElementException("Projet not found with ID: " + projetId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + userId));
        projet.getInvestors().add(user);
        return projetRepository.save(projet);
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return null;
        }
        String email = auth.getName();
        return userRepository.findByEmail(email);
    }

    public Projet findProjetEntityById(Long id) {
        return projetRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Projet not found with ID: " + id));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserByEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            System.err.println("No user found with email: " + email);
        }
        return user;
    }

    // NEW METHOD: Fetch project contacts directly as a map of User lists
    @Transactional
    public Map<String, Object> getProjectContacts(Long projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new NoSuchElementException("Projet not found with ID: " + projetId));

        Map<String, Object> contacts = new HashMap<>();
        contacts.put("founder", projet.getFounder());
        contacts.put("entrepreneurs", projet.getEntrepreneurs());
        contacts.put("coaches", projet.getCoaches());
        contacts.put("investors", projet.getInvestors());

        return contacts;
    }
    public List<Projet> getAllProjectsLimited() {
        return projetRepository.findAllProjectsLimited();
    }
}