package team.project.redboost.services;

import team.project.redboost.entities.Phase;
import team.project.redboost.entities.Task;
import team.project.redboost.repositories.PhaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Service
public class PhaseService {
    @Autowired
    private PhaseRepository phaseRepository;

    @Autowired
    private TaskService taskService;

    // Create a new phase
    public Phase createPhase(Phase phase) {
        phase.setCreatedAt(LocalDateTime.now());
        phase.setUpdatedAt(LocalDateTime.now());
        return phaseRepository.save(phase);
    }

    // Get all phases
    public List<Phase> getAllPhases() {
        return phaseRepository.findAll();
    }

    // Get a phase by ID (with tasks included)
    public Phase getPhaseById(Long phaseId) {
        return phaseRepository.findById(phaseId)
                .orElseThrow(() -> new RuntimeException("Phase not found"));
    }

    // Update a phase
    public Phase updatePhase(Long phaseId, Phase updatedPhase) {
        Phase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new RuntimeException("Phase not found"));
        phase.setPhaseName(updatedPhase.getPhaseName());
        phase.setStatus(updatedPhase.getStatus());
        phase.setStartDate(updatedPhase.getStartDate());
        phase.setEndDate(updatedPhase.getEndDate());
        phase.setDescription(updatedPhase.getDescription());
        phase.setTotalXpPoints(updatedPhase.getTotalXpPoints());
        phase.setUpdatedAt(LocalDateTime.now());
        return phaseRepository.save(phase);
    }

    // Delete a phase
    public void deletePhase(Long phaseId) {
        phaseRepository.deleteById(phaseId);
    }

    // Get phases within a date range
    public List<Phase> getPhasesByDateRange(LocalDate start, LocalDate end) {
        return phaseRepository.findByStartDateBetween(start, end);
    }

    // Assign tasks to a phase
    public Phase assignTasksToPhase(Long phaseId, List<Task> tasks) {
        Phase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new RuntimeException("Phase not found"));

        // Iterate through the tasks and assign them to the phase
        for (Task task : tasks) {
            task.setPhase(phase);  // Set the phase for each task
            taskService.updateTask(task.getTaskId(), task);  // Use getTaskId() to save the updated task
        }

        return phaseRepository.save(phase);  // Save the phase to persist changes
    }
}