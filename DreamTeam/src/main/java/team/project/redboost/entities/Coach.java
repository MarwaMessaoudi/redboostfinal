package team.project.redboost.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Entity
@Table(name = "coach_details")
@PrimaryKeyJoinColumn(name = "user_id")
@EqualsAndHashCode(callSuper = true)
public class Coach extends User {

    @Size(min = 2, max = 100)
    @Column(name = "specialization")
    private String specialization = "Unknown";

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience = 0;

    @Size(max = 255)
    @Column(name = "skills") // Explicitly mark as a String column
    private String skills;

    @Size(max = 255)
    @Column(name = "expertise") // Explicitly mark as a String column
    private String expertise;

    // Transient method to handle skills as a list (not persisted)
    @Transient
    public List<String> getSkillsList() {
        if (skills == null || skills.trim().isEmpty()) return new ArrayList<>();
        return Arrays.stream(skills.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    public void setSkillsList(List<String> skillsList) {
        if (skillsList == null || skillsList.isEmpty()) {
            this.skills = null;
        } else {
            this.skills = String.join(",", skillsList);
        }
    }

    // Transient method to handle expertise as a list (not persisted)
    @Transient
    public List<String> getExpertiseList() {
        if (expertise == null || expertise.trim().isEmpty()) return new ArrayList<>();
        return Arrays.stream(expertise.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    public void setExpertiseList(List<String> expertiseList) {
        if (expertiseList == null || expertiseList.isEmpty()) {
            this.expertise = null;
        } else {
            this.expertise = String.join(",", expertiseList);
        }
    }
}