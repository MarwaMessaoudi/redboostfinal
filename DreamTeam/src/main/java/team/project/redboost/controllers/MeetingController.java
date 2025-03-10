package team.project.redboost.controllers;

import org.springframework.http.ResponseEntity;
import team.project.redboost.entities.Meeting;
import team.project.redboost.services.JitsiService;
import team.project.redboost.services.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
@CrossOrigin(origins = "http://localhost:4200")

@RestController
@RequestMapping("/api/meetings")

public class MeetingController {

    private final MeetingService meetingService;

    @Autowired
    private JitsiService jitsiService;

    @Autowired
    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @PostMapping("/create")
    public Meeting createMeeting(@RequestBody Meeting newMeeting) {


        Meeting createdMeeting = meetingService.createMeeting(newMeeting);

        // Créez le lien Jitsi
        String jitsiUrl = jitsiService.createMeetingLink(createdMeeting);

        // Mettez à jour seulement le lien Jitsi
        createdMeeting.setJitsiUrl(jitsiUrl);

        // Vous pouvez maintenant mettre à jour la réunion en base de données, mais seulement pour le lien Jitsi
        meetingService.updateMeeting(createdMeeting.getId(), createdMeeting);

        return createdMeeting;
    }

    @GetMapping
    public List<Meeting> getAllMeetings() {
        return meetingService.getAllMeetings();
    }

    @GetMapping("/{id}")
    public Optional<Meeting> getMeetingById(@PathVariable Long id) {
        return meetingService.getMeetingById(id);
    }

    @PutMapping("/{id}")
    public Meeting updateMeeting(@PathVariable Long id, @RequestBody Meeting updatedMeeting) {
        return meetingService.updateMeeting(id, updatedMeeting);
    }

    @DeleteMapping("/{id}")
    public void deleteMeeting(@PathVariable Long id) {
        meetingService.deleteMeeting(id);
    }


    @GetMapping("/participant/{id}")
    public ResponseEntity<List<Meeting>> findMeetingsByParticipant(@PathVariable Long id) {
        List<Meeting> meetings = meetingService.getMeetingsOfParticipant(id);
        return ResponseEntity.ok(meetings);
    }

    @GetMapping("/by-participant/{participantId}/count")
    public ResponseEntity<Long> getMeetingCountByParticipant(@PathVariable Long participantId) {
        Long meetingCount = meetingService.getMeetingCountByParticipantId(participantId);
        return ResponseEntity.ok(meetingCount);
    }

    @GetMapping("/active")
    public List<Meeting> getActiveMeetings() {
        LocalDateTime now = LocalDateTime.now();
        return meetingService.findActiveMeetings(now);
    }

}



