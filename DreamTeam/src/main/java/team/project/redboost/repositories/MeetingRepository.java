package team.project.redboost.repositories;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import team.project.redboost.entities.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    List<Meeting> findByTitle(String title);

    List<Meeting> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);


    @Query("SELECT m FROM Meeting m JOIN m.participants p WHERE p.id = :participantId")
    List<Meeting> findMeetingsByParticipantId(@Param("participantId") Long participantId);


    @Query("SELECT COUNT(m) FROM Meeting m JOIN m.participants p WHERE p.id = :participantId")
    Long countMeetingsByParticipantId(@Param("participantId") Long participantId);

    List<Meeting> findByStartTimeBeforeAndEndTimeAfter(LocalDateTime startTime, LocalDateTime endTime);
}