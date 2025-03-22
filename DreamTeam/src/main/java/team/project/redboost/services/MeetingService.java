package team.project.redboost.services;

import org.springframework.data.repository.query.Param;
import team.project.redboost.entities.Meeting;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MeetingService {
    Meeting createMeeting(Meeting newMeeting);

    List<Meeting> getAllMeetings();

    Optional<Meeting> getMeetingById(Long id);

    Meeting updateMeeting(Long id, Meeting updatedMeeting);

    void deleteMeeting(Long id);

    List<Meeting> getMeetingsOfParticipant(Long participantId);

    public Long getMeetingCountByParticipantId(Long participantId);

    public List<Meeting> findActiveMeetings(LocalDateTime now);
}