package team.project.redboost.services;

import jakarta.transaction.Transactional;
import team.project.redboost.entities.Meeting;
import team.project.redboost.entities.Note;
import team.project.redboost.repositories.MeetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MeetingServiceImpl implements MeetingService {

    private final MeetingRepository meetingRepository;

    @Autowired
    public MeetingServiceImpl(MeetingRepository meetingRepository) {

        this.meetingRepository = meetingRepository;
    }

    @Override
    public Meeting createMeeting(Meeting meeting) {
        return meetingRepository.save(meeting);
    }
    @Override
    public List<Meeting> getAllMeetings() {
        return meetingRepository.findAll();
    }

    @Override
    public Optional<Meeting> getMeetingById(Long id) {
        return meetingRepository.findById(id);
    }

    @Override
    public Meeting updateMeeting(Long id, Meeting updatedMeeting) {
        return meetingRepository.findById(id).map(existingMeeting -> {
            existingMeeting.setTitle(updatedMeeting.getTitle());
            existingMeeting.setStartTime(updatedMeeting.getStartTime());
            existingMeeting.setEndTime(updatedMeeting.getEndTime());
            existingMeeting.setCapacity(updatedMeeting.getCapacity());
            existingMeeting.setJitsiUrl(updatedMeeting.getJitsiUrl());
            return meetingRepository.save(existingMeeting);
        }).orElseThrow(() -> new RuntimeException("Meeting not found"));
    }

    @Override
    public void deleteMeeting(Long id) {
        meetingRepository.deleteById(id);
    }


    @Override
    public List<Meeting> getMeetingsOfParticipant(Long participantId) {
        return meetingRepository.findMeetingsByParticipantId(participantId);
    }

    @Override
    public Long getMeetingCountByParticipantId(Long participantId) {
        return meetingRepository.countMeetingsByParticipantId(participantId);
    }

    public List<Meeting> findActiveMeetings(LocalDateTime now) {
        return meetingRepository.findByStartTimeBeforeAndEndTimeAfter(now, now);
    }

}