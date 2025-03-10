package team.project.redboost.services;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventAttendee;
import com.google.api.services.calendar.model.EventDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.stereotype.Service;
import team.project.redboost.entities.RendezVous;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class GoogleCalendarService {

    private static final String APPLICATION_NAME = "RedBoostCalendarIntegration";
    private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();
    private static final Logger logger = LoggerFactory.getLogger(GoogleCalendarService.class);

    private final OAuth2AuthorizedClientService clientService;
    private final NetHttpTransport httpTransport;

    public GoogleCalendarService(OAuth2AuthorizedClientService clientService) {
        this.clientService = clientService;
        NetHttpTransport tempTransport = null;
        try {
            logger.info("Initializing NetHttpTransport for Google API");
            tempTransport = GoogleNetHttpTransport.newTrustedTransport();
            logger.info("NetHttpTransport initialized successfully");
        } catch (GeneralSecurityException e) {
            logger.error("Security exception while initializing HTTP transport: {}", e.getMessage(), e);
            throw new IllegalStateException("Failed to initialize HTTP transport due to security issue", e);
        } catch (IOException e) {
            logger.error("IO exception while initializing HTTP transport: {}", e.getMessage(), e);
            throw new IllegalStateException("Failed to initialize HTTP transport due to IO issue", e);
        }
        this.httpTransport = tempTransport;
    }

    public void ajouterRendezVous(RendezVous rdv, Authentication authentication) throws IOException {
        try {
            logger.info("Starting to add event to Google Calendar: {}", rdv.getTitle());

            // Get OAuth2 client for the authenticated user
            OAuth2AuthorizedClient authorizedClient = clientService.loadAuthorizedClient(
                    "google-calendar", authentication.getName());
            if (authorizedClient == null || authorizedClient.getAccessToken() == null) {
                logger.warn("No authorized client or access token found for user: {}", authentication.getName());
                throw new IllegalStateException("User not authenticated with Google Calendar");
            }
            String accessToken = authorizedClient.getAccessToken().getTokenValue();
            logger.info("Using access token: {}...", accessToken.substring(0, Math.min(10, accessToken.length())));

            // Build Calendar service with access token
            Calendar service = new Calendar.Builder(httpTransport, JSON_FACTORY, null)
                    .setApplicationName(APPLICATION_NAME)
                    .setHttpRequestInitializer(request -> request.getHeaders().setAuthorization("Bearer " + accessToken))
                    .build();

            // Create event
            Event event = new Event()
                    .setSummary(rdv.getTitle())
                    .setDescription(rdv.getDescription());

            // Parse date and time
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            LocalDateTime startTime = LocalDateTime.parse(rdv.getDate() + " " + rdv.getHeure(), formatter);
            LocalDateTime endTime = startTime.plusHours(1);

            DateTime startDateTime = new DateTime(startTime.atZone(ZoneId.of("Europe/Paris")).toInstant().toEpochMilli());
            EventDateTime start = new EventDateTime()
                    .setDateTime(startDateTime)
                    .setTimeZone("Europe/Paris");
            event.setStart(start);

            DateTime endDateTime = new DateTime(endTime.atZone(ZoneId.of("Europe/Paris")).toInstant().toEpochMilli());
            EventDateTime end = new EventDateTime()
                    .setDateTime(endDateTime)
                    .setTimeZone("Europe/Paris");
            event.setEnd(end);

            // Add attendees
            List<EventAttendee> attendees = List.of(
                    new EventAttendee().setEmail("ahmedbenmohamed799@gmail.com"),
                    new EventAttendee().setEmail("rhajboubaker@gmail.com")
            );
            event.setAttendees(attendees);

            // Insert event
            event = service.events().insert("primary", event).execute();
            logger.info("Event created successfully: {}", event.getHtmlLink());

        } catch (IOException e) {
            logger.error("IOException during event creation: {}", e.getMessage(), e);
            throw e; // Re-throw to be handled by controller
        } catch (Exception e) {
            logger.error("Unexpected error adding event to Google Calendar: {}", e.getMessage(), e);
            throw new RuntimeException("Calendar error: " + e.getClass().getName() + " - " + e.getMessage(), e);
        }
    }
}