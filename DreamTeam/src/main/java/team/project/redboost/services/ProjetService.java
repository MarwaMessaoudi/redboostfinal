package team.project.redboost.services;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import team.project.redboost.dto.StatisticsDTOs.*;
import team.project.redboost.entities.*;
import team.project.redboost.repositories.ProjetRepository;
import team.project.redboost.repositories.UserRepository;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
public class ProjetService {
    private final ProjetRepository projetRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final CloudinaryService cloudinaryService;
    private final GoogleDriveService googleDriveService;

    private static final int FREE_PROJECT_LIMIT = 3;
    private static final double REVIEW_READY_THRESHOLD = 0.8; // 80% tasks DONE

    @Autowired
    public ProjetService(
            ProjetRepository projetRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            CloudinaryService cloudinaryService,
            GoogleDriveService googleDriveService) {
        this.projetRepository = projetRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.cloudinaryService = cloudinaryService;
        this.googleDriveService = googleDriveService;
    }

    @Transactional
    public Projet createProjet(Projet projet, String imageUrl, Long creatorId) {
        System.out.println("Starting createProjet for name: " + projet.getName() + ", creatorId: " + creatorId);
        User founder = userRepository.findById(creatorId)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + creatorId));

        long projectCount = projetRepository.countByFounder(founder);
        if (projectCount >= FREE_PROJECT_LIMIT) {
            throw new IllegalStateException("You have reached the free project limit of " + FREE_PROJECT_LIMIT + ". Please upgrade your account to create more projects.");
        }

        if (projet.getName() == null || projet.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Project name is required");
        }
        if (projetRepository.existsByNameIgnoreCase(projet.getName())) {
            throw new IllegalArgumentException("A project with the name '" + projet.getName() + "' already exists. Please join it or use a different name.");
        }

        if (imageUrl != null && !imageUrl.isEmpty()) {
            projet.setLogoUrl(imageUrl);
        }
        if (projet.getGlobalScore() == null) projet.setGlobalScore(0.0);
        if (projet.getLastUpdated() == null) projet.setLastUpdated(LocalDate.now());
        if (projet.getLastEvaluationDate() == null) projet.setLastEvaluationDate(LocalDate.now());

        if (founder.getRole() != Role.ENTREPRENEUR) {
            throw new IllegalArgumentException("User with ID " + creatorId + " is not an Entrepreneur");
        }
        projet.setFounder(founder);
        projet.getEntrepreneurs().add(founder);

        System.out.println("Saving projet to database: " + projet.getName());
        Projet savedProjet = projetRepository.saveAndFlush(projet);
        System.out.println("Projet saved with ID: " + savedProjet.getId());

        // Google Drive operations in a separate method
        try {
            setupGoogleDriveFolders(savedProjet, founder.getEmail());
        } catch (IOException e) {
            System.err.println("Failed to set up Google Drive folders: " + e.getMessage());
            // Log the error but don't throw to avoid rollback
            savedProjet.setDriveFolderId("error-folder-id");
            savedProjet.setAccompagnementFolderId("error-subfolder-id");
            projetRepository.save(savedProjet);
        }

        return savedProjet;
    }

    private void setupGoogleDriveFolders(Projet projet, String founderEmail) throws IOException {
        System.out.println("Creating Google Drive folder for projet: " + projet.getName());
        String folderId = googleDriveService.createFolder(projet.getName());
        projet.setDriveFolderId(folderId);
        googleDriveService.shareFolder(folderId, founderEmail, "writer");
        String accompagnementFolderId = googleDriveService.createSubFolder("Accompagnement", folderId);
        projet.setAccompagnementFolderId(accompagnementFolderId);
        googleDriveService.shareFolder(accompagnementFolderId, founderEmail, "writer");
        System.out.println("Google Drive folders created: " + folderId + ", " + accompagnementFolderId);
        projetRepository.save(projet);
    }

    @Transactional
    public Projet updateProjet(Long id, Projet updatedProjet, String imageUrl) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Projet non trouvé avec l'ID : " + id));

        if (imageUrl != null && !imageUrl.isEmpty() && projet.getLogoUrl() != null) {
            try {
                String oldPublicId = extractPublicIdFromUrl(projet.getLogoUrl());
                if (oldPublicId != null) {
                    cloudinaryService.deleteImage(oldPublicId);
                }
            } catch (Exception e) {
                System.err.println("Failed to delete old Cloudinary image: " + e.getMessage());
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
                String publicId = extractPublicIdFromUrl(projet.getLogoUrl());
                if (publicId != null) {
                    cloudinaryService.deleteImage(publicId);
                }
            } catch (Exception e) {
                System.err.println("Failed to delete Cloudinary image: " + e.getMessage());
            }
        }

        projetRepository.delete(projet);
    }

    private String extractPublicIdFromUrl(String url) {
        if (url == null || !url.contains("cloudinary.com")) {
            return null;
        }
        String[] parts = url.split("/");
        String fileName = parts[parts.length - 1];
        return fileName.substring(0, fileName.lastIndexOf('.'));
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

        try {
            if (projet.getDriveFolderId() != null) {
                googleDriveService.shareFolder(projet.getDriveFolderId(), collaborator.getEmail(), "writer");
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to share Google Drive folder with collaborator", e);
        }

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

    @Transactional
    public Projet addEntrepreneurToProjet(Long projetId, Long userId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new NoSuchElementException("Projet not found with ID: " + projetId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + userId));
        if (user.getRole() != Role.ENTREPRENEUR) {
            throw new IllegalArgumentException("User with ID " + userId + " is not an Entrepreneur");
        }
        if (!projet.getEntrepreneurs().contains(user)) {
            projet.getEntrepreneurs().add(user);
            try {
                if (projet.getDriveFolderId() != null) {
                    googleDriveService.shareFolder(projet.getDriveFolderId(), user.getEmail(), "writer");
                }
            } catch (IOException e) {
                throw new RuntimeException("Failed to share Google Drive folder with entrepreneur", e);
            }
        }
        return projetRepository.save(projet);
    }

    @Transactional
    public Projet addCoachToProjet(Long projetId, Long userId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new NoSuchElementException("Projet not found with ID: " + projetId));
        User coach = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + userId));
        if (coach.getRole() != Role.COACH) {
            throw new IllegalArgumentException("User with ID " + userId + " is not a Coach");
        }
        if (!projet.getCoaches().contains(coach)) {
            projet.getCoaches().add(coach);
            try {
                if (projet.getDriveFolderId() != null) {
                    googleDriveService.shareFolder(projet.getDriveFolderId(), coach.getEmail(), "writer");
                }
            } catch (IOException e) {
                throw new RuntimeException("Failed to share Google Drive folder with coach", e);
            }
        }
        return projetRepository.save(projet);
    }

    @Transactional
    public Projet addInvestorToProjet(Long projetId, Long userId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new NoSuchElementException("Projet not found with ID: " + projetId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + userId));
        if (!projet.getInvestors().contains(user)) {
            projet.getInvestors().add(user);
        }
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

    @Transactional
    public Map<String, Object> getProjectContacts(Long projetId) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new NoSuchElementException("Projet not found with ID: " + projetId));

        Map<String, Object> contacts = new HashMap<>();
        contacts.put("founder", projet.getFounder());
        contacts.put("entrepreneurs", projet.getEntrepreneurs());
        contacts.put("coaches", projet.getCoaches());
        contacts.put("investors", projet.getInvestors());
        contacts.put("driveFolderId", projet.getDriveFolderId());

        return contacts;
    }

    public List<Projet> getAllProjectsLimited() {
        return projetRepository.findAllProjectsLimited();
    }

    public List<Coach> getCoachesForEntrepreneur(Long userId) {
        List<Coach> coaches = projetRepository.findCoachesByEntrepreneurId(userId);
        if (coaches.isEmpty()) {
            throw new RuntimeException("Aucun coach trouvé pour l'entrepreneur avec l'ID : " + userId);
        }
        return coaches;
    }

    public List<Projet> getProjectsByCoach(Long userId) {
        User coach = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + userId));
        if (coach.getRole() != Role.COACH) {
            throw new IllegalArgumentException("User with ID " + userId + " is not a Coach");
        }
        User currentUser = getCurrentUser();
        if (currentUser == null || (!currentUser.getId().equals(userId) && currentUser.getRole() != Role.ADMIN)) {
            throw new IllegalArgumentException("Unauthorized access to coach projects");
        }
        return projetRepository.findByCoachesId(userId);
    }

    public DashboardStatisticsDTO getCoachDashboardStatistics(Long userId) {
        validateCoach(userId);
        DashboardStatisticsDTO stats = new DashboardStatisticsDTO();
        stats.setProjects(getCoachProjectStatistics(userId));
        stats.setPhases(getCoachPhaseStatistics(userId));
        stats.setTasks(getCoachTaskStatistics(userId));
        stats.setPendingActions(getCoachPendingActions(userId));
        stats.setEngagement(getCoachEngagementStatistics(userId));
        return stats;
    }

    private ProjectStatisticsDTO getCoachProjectStatistics(Long userId) {
        List<Projet> projects = projetRepository.findByCoachesId(userId);

        ProjectStatisticsDTO stats = new ProjectStatisticsDTO();
        stats.setTotalProjects(projects.size());

        int activeProjects = (int) projects.stream()
                .filter(p -> !p.getStatus().equals("TERMINE"))
                .count();
        stats.setActiveProjects(activeProjects);

        double totalProgress = 0;
        int reviewReadyProjects = 0;
        for (Projet project : projects) {
            List<Phase> phases = project.getPhases();
            if (phases == null || phases.isEmpty()) continue;
            long completedPhases = phases.stream()
                    .filter(ph -> ph.getStatus().toString().equals("COMPLETED"))
                    .count();
            totalProgress += (double) completedPhases / phases.size() * 100;
            boolean hasReviewReadyPhase = phases.stream().anyMatch(ph -> {
                List<Task> tasks = ph.getTasks();
                if (tasks == null || tasks.isEmpty()) return false;
                long doneTasks = tasks.stream()
                        .filter(t -> t.getStatus().toString().equals("DONE"))
                        .count();
                return (double) doneTasks / tasks.size() >= REVIEW_READY_THRESHOLD;
            });
            if (hasReviewReadyPhase) reviewReadyProjects++;
        }
        stats.setAverageProgress(projects.isEmpty() ? 0 : totalProgress / projects.size());
        stats.setReviewReadyProjects(reviewReadyProjects);

        return stats;
    }

    private List<PhaseStatisticsDTO> getCoachPhaseStatistics(Long userId) {
        List<Projet> projects = projetRepository.findByCoachesId(userId);
        List<PhaseStatisticsDTO> phaseStats = new ArrayList<>();

        for (Projet project : projects) {
            List<Phase> phases = project.getPhases();
            if (phases == null) continue;
            for (Phase phase : phases) {
                PhaseStatisticsDTO stat = new PhaseStatisticsDTO();
                stat.setProjectId(project.getId());
                stat.setProjectName(project.getName());
                stat.setPhaseId(phase.getPhaseId());
                stat.setPhaseName(phase.getPhaseName());
                stat.setStatus(phase.getStatus().toString());

                List<Task> tasks = phase.getTasks();
                if (tasks != null && !tasks.isEmpty()) {
                    long doneTasks = tasks.stream()
                            .filter(t -> t.getStatus().toString().equals("DONE"))
                            .count();
                    stat.setCompletionPercentage((double) doneTasks / tasks.size() * 100);
                    stat.setReviewReady((double) doneTasks / tasks.size() >= REVIEW_READY_THRESHOLD);
                    long overdueTasks = tasks.stream()
                            .filter(t -> t.getEndDate() != null && t.getEndDate().isBefore(LocalDate.now()))
                            .count();
                    stat.setOverdueTasks((int) overdueTasks);
                } else {
                    stat.setCompletionPercentage(0);
                    stat.setReviewReady(false);
                    stat.setOverdueTasks(0);
                }
                phaseStats.add(stat);
            }
        }
        return phaseStats;
    }

    private TaskStatisticsDTO getCoachTaskStatistics(Long userId) {
        List<Projet> projects = projetRepository.findByCoachesId(userId);

        TaskStatisticsDTO stats = new TaskStatisticsDTO();
        int pendingValidations = 0;
        int overdueTasks = 0;

        for (Projet project : projects) {
            List<Phase> phases = project.getPhases();
            if (phases == null) continue;
            for (Phase phase : phases) {
                List<Task> tasks = phase.getTasks();
                if (tasks == null) continue;
                for (Task task : tasks) {
                    if (task.getStatus().toString().equals("IN_PROGRESS") && task.getComments() != null && !task.getComments().isEmpty()) {
                        pendingValidations++;
                    }
                    if (task.getEndDate() != null && task.getEndDate().isBefore(LocalDate.now())) {
                        overdueTasks++;
                    }
                }
            }
        }
        stats.setPendingValidations(pendingValidations);
        stats.setOverdueTasks(overdueTasks);

        return stats;
    }

    private List<PendingActionDTO> getCoachPendingActions(Long userId) {
        List<Projet> projects = projetRepository.findByCoachesId(userId);
        List<PendingActionDTO> actions = new ArrayList<>();

        for (Projet project : projects) {
            List<Phase> phases = project.getPhases();
            if (phases == null) continue;
            for (Phase phase : phases) {
                List<Task> tasks = phase.getTasks();
                if (tasks != null && !tasks.isEmpty()) {
                    long doneTasks = tasks.stream()
                            .filter(t -> t.getStatus().toString().equals("DONE"))
                            .count();
                    if ((double) doneTasks / tasks.size() >= REVIEW_READY_THRESHOLD) {
                        PendingActionDTO action = new PendingActionDTO();
                        action.setType("phase");
                        action.setProjectId(project.getId());
                        action.setProjectName(project.getName());
                        action.setPhaseId(phase.getPhaseId());
                        action.setPhaseName(phase.getPhaseName());
                        action.setDetails("Ready for review, updated " + phase.getUpdatedAt());
                        action.setUpdatedAt(phase.getUpdatedAt());
                        actions.add(action);
                    }
                }
                if (tasks != null) {
                    for (Task task : tasks) {
                        if (task.getStatus().toString().equals("IN_PROGRESS") && task.getComments() != null && !task.getComments().isEmpty()) {
                            PendingActionDTO action = new PendingActionDTO();
                            action.setType("task");
                            action.setProjectId(project.getId());
                            action.setProjectName(project.getName());
                            action.setPhaseId(phase.getPhaseId());
                            action.setPhaseName(phase.getPhaseName());
                            action.setTaskId(task.getTaskId());
                            action.setTaskTitle(task.getTitle());
                            action.setDetails("Ready for review, comments: " + task.getComments().size());
                            action.setUpdatedAt(task.getUpdatedAt());
                            actions.add(action);
                        }
                        if (task.getEndDate() != null && task.getEndDate().isBefore(LocalDate.now())) {
                            PendingActionDTO action = new PendingActionDTO();
                            action.setType("task");
                            action.setProjectId(project.getId());
                            action.setProjectName(project.getName());
                            action.setPhaseId(phase.getPhaseId());
                            action.setPhaseName(phase.getPhaseName());
                            action.setTaskId(task.getTaskId());
                            action.setTaskTitle(task.getTitle());
                            action.setDetails("Overdue since " + task.getEndDate());
                            action.setUpdatedAt(task.getUpdatedAt());
                            actions.add(action);
                        }
                    }
                }
            }
        }
        return actions;
    }

    private EngagementStatisticsDTO getCoachEngagementStatistics(Long userId) {
        List<Projet> projects = projetRepository.findByCoachesId(userId);

        EngagementStatisticsDTO stats = new EngagementStatisticsDTO();
        int commentsCount = 0;
        int phasesValidated = 0;

        for (Projet project : projects) {
            List<Phase> phases = project.getPhases();
            if (phases == null) continue;
            for (Phase phase : phases) {
                if (phase.getStatus().toString().equals("COMPLETED")) {
                    phasesValidated++;
                }
                List<Task> tasks = phase.getTasks();
                if (tasks == null) continue;
                for (Task task : tasks) {
                    if (task.getComments() != null) {
                        commentsCount += task.getComments().size();
                    }
                }
            }
        }
        stats.setCommentsCount(commentsCount);
        stats.setPhasesValidated(phasesValidated);
        stats.setMeetingsScheduled(0); // Placeholder for rendez-vous module

        return stats;
    }

    private void validateCoach(Long userId) {
        User coach = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + userId));
        if (coach.getRole() != Role.COACH) {
            throw new IllegalArgumentException("User with ID " + userId + " is not a Coach");
        }
        User currentUser = getCurrentUser();
        if (currentUser == null || (!currentUser.getId().equals(userId) && currentUser.getRole() != Role.ADMIN)) {
            throw new IllegalArgumentException("Unauthorized access to coach statistics");
        }
    }
}