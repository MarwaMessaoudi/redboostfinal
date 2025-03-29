package team.project.redboost.services;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import team.project.redboost.entities.Meeting;

@Service
public class JitsiService {


    private final String JITSI_URL = "http://localhost:8000"; // URL de votre instance Jitsi
    public String createMeetingLink(Meeting meeting) {
        // Vous pouvez ajouter un token de sécurité ou toute autre configuration si nécessaire
        String meetingUrl = JITSI_URL + "/" + meeting.getTitle();
        return meetingUrl;
    }
}
