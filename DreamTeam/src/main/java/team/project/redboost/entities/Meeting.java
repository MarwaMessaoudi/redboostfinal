package team.project.redboost.entities;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "meetings")
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer capacity;  // Capacity of the meeting room

    private Integer currentParticipants;  // Current number of participants

    private String accessCode;  // Access code for the meeting

    private String jitsiUrl;


    @ManyToMany
    @JoinTable(
            name = "meeting_participants", // Nom de la table de jointure entre Meeting et User
            joinColumns = @JoinColumn(name = "meeting_id"), // Clé étrangère vers la table Meeting
            inverseJoinColumns = @JoinColumn(name = "user_id") // Clé étrangère vers la table User
    )
    private List<User> participants; // Liste des


    @OneToOne(mappedBy = "meeting", cascade = CascadeType.ALL)
    private Note note;
    @OneToOne(mappedBy = "meeting", cascade = CascadeType.ALL)
    private Record record;

   /* @OneToOne
    private Rendezvous rendezvous;*/

    public List<User> getParticipants() {
        return participants;
    }

    public void setParticipants(List<User> participants) {
        this.participants = participants;
    }

  /*  public Rendezvous getRendezvous() {
        return rendezvous;
    }

    public void setRendezvous(Rendezvous rendezvous) {
        this.rendezvous = rendezvous;
    }*/

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }




    public Note getNote() {
        return note;
    }

    public void setNote(Note note) {
        this.note = note;
    }

    public Record getRecord() {
        return record;
    }

    public void setRecord(Record record) {
        this.record = record;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Integer getCurrentParticipants() {
        return currentParticipants;
    }

    public void setCurrentParticipants(Integer currentParticipants) {
        this.currentParticipants = currentParticipants;
    }

    public String getAccessCode() {
        return accessCode;
    }

    public void setAccessCode(String accessCode) {
        this.accessCode = accessCode;
    }

    public String getJitsiUrl() {
        return jitsiUrl;
    }

    public void setJitsiUrl(String jitsiUrl) {
        this.jitsiUrl = jitsiUrl;
    }
}