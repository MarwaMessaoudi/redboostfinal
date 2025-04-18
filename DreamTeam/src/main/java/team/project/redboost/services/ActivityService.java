package team.project.redboost.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import team.project.redboost.entities.Activity;
import team.project.redboost.entities.Program;
import team.project.redboost.repositories.ActivityRepository;
import team.project.redboost.repositories.ProgramRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ProgramRepository programRepository;

    public List<Activity> getActivitiesByProgram(Long programId) {
        return activityRepository.findByProgram_Id(programId);
    }

    public Activity createActivity(Activity activity, Long programId) {
        Program program = programRepository.findById(programId)
            .orElseThrow(() -> new RuntimeException("Program not found"));

        activity.setProgram(program);
        return activityRepository.save(activity);
    }
    public Activity getActivityById(Long id) {
        return activityRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Activité introuvable avec ID: " + id));
    }

    public List<Activity> getActivitiesByProgramId(Long programId) {
        return activityRepository.findByProgram_Id(programId);
    }

    public Activity createActivityForProgram(Long programId, Activity activity) {
        Program program = programRepository.findById(programId)
            .orElseThrow(() -> new RuntimeException("Programme introuvable avec ID: " + programId));
        activity.setProgram(program);
        return activityRepository.save(activity);
    }

    public Activity updateActivity(Long id, Activity updatedActivity) {
        Activity existing = getActivityById(id);
        existing.setName(updatedActivity.getName());
        existing.setDescription(updatedActivity.getDescription());
        existing.setStartDate(updatedActivity.getStartDate());
        existing.setEndDate(updatedActivity.getEndDate());
        return activityRepository.save(existing);
    }

    public void deleteActivity(Long id) {
        activityRepository.deleteById(id);
    }

}
