package team.project.redboost.entities;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.util.List;

@Data
@Entity
@Table(name = "task_categories")  // Avoids conflict with reserved keywords
public class TaskCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @OneToMany(mappedBy = "taskCategory", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("categoryTasks") // Corrected: Added ManagedReference and a name
    private List<Task> tasks;
}