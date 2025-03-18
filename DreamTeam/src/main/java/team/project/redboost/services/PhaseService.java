package team.project.redboost.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import team.project.redboost.entities.Projet;
import team.project.redboost.entities.Phase;
import team.project.redboost.entities.Task;
import team.project.redboost.repositories.PhaseRepository;
import team.project.redboost.repositories.ProjetRepository;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class PhaseService {
    @Autowired
    private PhaseRepository phaseRepository;

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private TaskService taskService;

    public Phase createPhase(Phase phase) {
        if (phase.getProjet() == null && phase.getProjetId() != null) {
            Projet projet = projetRepository.findById(phase.getProjetId())
                    .orElseThrow(() -> new RuntimeException("Projet not found with ID: " + phase.getProjetId()));
            phase.setProjet(projet);
        }
        phase.setCreatedAt(LocalDateTime.now());
        phase.setUpdatedAt(LocalDateTime.now());
        return phaseRepository.save(phase);
    }

    public List<Phase> getAllPhases() {
        return phaseRepository.findAll();
    }

    public Phase getPhaseById(Long phaseId) {
        return phaseRepository.findById(phaseId)
                .orElseThrow(() -> new RuntimeException("Phase not found"));
    }

    public Phase updatePhase(Long phaseId, Phase updatedPhase) {
        Phase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new RuntimeException("Phase not found"));
        phase.setPhaseName(updatedPhase.getPhaseName());
        phase.setStatus(updatedPhase.getStatus());
        phase.setStartDate(updatedPhase.getStartDate());
        phase.setEndDate(updatedPhase.getEndDate());
        phase.setDescription(updatedPhase.getDescription());
        phase.setTotalXpPoints(updatedPhase.getTotalXpPoints());
        if (updatedPhase.getProjetId() != null && (phase.getProjet() == null || !phase.getProjet().getId().equals(updatedPhase.getProjetId()))) {
            Projet projet = projetRepository.findById(updatedPhase.getProjetId())
                    .orElseThrow(() -> new RuntimeException("Projet not found with ID: " + updatedPhase.getProjetId()));
            phase.setProjet(projet);
        }
        phase.setUpdatedAt(LocalDateTime.now());
        return phaseRepository.save(phase);
    }

    public void deletePhase(Long phaseId) {
        phaseRepository.deleteById(phaseId);
    }

    public List<Phase> getPhasesByDateRange(LocalDate start, LocalDate end) {
        return phaseRepository.findByStartDateBetween(start, end);
    }

    public Phase assignTasksToPhase(Long phaseId, List<Task> tasks) {
        Phase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new RuntimeException("Phase not found"));
        for (Task task : tasks) {
            task.setPhase(phase);
            taskService.updateTask(task.getTaskId(), task);
        }
        return phaseRepository.save(phase);
    }

    // Fetch entrepreneurs grouped by project ID
    public List<Map<String, Object>> getEntrepreneursByProject(Long projetId) {
        return phaseRepository.findEntrepreneursByProject(projetId);
    }
}
