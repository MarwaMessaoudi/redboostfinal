package team.project.redboost.services;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.api.services.calendar.model.EventAttendee;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import team.project.redboost.entities.RendezVous;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;

@Service
public class GoogleCalendarService {


    private static final String APPLICATION_NAME = "RedBoostCalendarIntegration";
    private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();
    private static final String CREDENTIALS_FILE_PATH = "client_secret.json"; // Chemin vers le fichier OAuth 2.0 credentials
    private static final List<String> SCOPES = Collections.singletonList(CalendarScopes.CALENDAR);
    private static final String TOKENS_DIRECTORY_PATH = "tokens";
    public void ajouterRendezVous(RendezVous rdv) {
        try {
            System.out.println("Début de l'ajout dans Google Calendar");

            // Créer un événement avec des attendees statiques
            Event event = new Event()
                    .setSummary(rdv.getTitle())
                    .setDescription(rdv.getDescription());

            // Parser date et heure
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            LocalDateTime startTime = LocalDateTime.parse(rdv.getDate() + " " + rdv.getHeure(), formatter);
            LocalDateTime endTime = startTime.plusHours(1); // Durée de 1 heure, ajustez selon vos besoins
            // Définir la date/heure de début
            DateTime startDateTime = new DateTime(startTime.atZone(ZoneId.of("Europe/Paris")).toInstant().toEpochMilli());
            EventDateTime start = new EventDateTime()
                    .setDateTime(startDateTime)
                    .setTimeZone("Europe/Paris");
            event.setStart(start);

            // Définir la date/heure de fin
            DateTime endDateTime = new DateTime(endTime.atZone(ZoneId.of("Europe/Paris")).toInstant().toEpochMilli());
            EventDateTime end = new EventDateTime()
                    .setDateTime(endDateTime)
                    .setTimeZone("Europe/Paris");
            event.setEnd(end);

            // Ajouter les attendees statiques (vos emails spécifiques)
            List<EventAttendee> attendees = List.of(
                    new EventAttendee().setEmail("ahmedbenmohamed799@gmail.com"),
                    new EventAttendee().setEmail("baylassenelabed03@gmail.com")
            );
            event.setAttendees(attendees);

            // Créer le service et insérer l'événement
            Calendar service = getCalendarService();
            event = service.events().insert("primary", event).execute();

            System.out.println("Événement créé avec succès: " + event.getHtmlLink());

        } catch (Exception e) {
            System.err.println("Erreur lors de l'ajout dans Google Calendar: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erreur calendrier: " + e.getClass().getName() + " - " + e.getMessage(), e);
        }
    }
    private Calendar getCalendarService() throws GeneralSecurityException, IOException {
        // Charger les credentials OAuth 2.0
        InputStream in = new ClassPathResource(CREDENTIALS_FILE_PATH).getInputStream();
        if (in == null) {
            throw new FileNotFoundException("Resource not found: " + CREDENTIALS_FILE_PATH);
        }

        GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(JSON_FACTORY, new InputStreamReader(in));
        // Configurer le flux d’autorisation
        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JSON_FACTORY,
                clientSecrets,
                SCOPES)
                .setDataStoreFactory(new FileDataStoreFactory(new File(TOKENS_DIRECTORY_PATH)))
                .setAccessType("offline")
                .build();
        // Authentification interactive avec un port correspondant aux URIs autorisés
        LocalServerReceiver receiver = new LocalServerReceiver.Builder().setPort(8088).build(); // Garder le port 8087
        Credential credential = new AuthorizationCodeInstalledApp(flow, receiver).authorize("user");

        return new Calendar.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JSON_FACTORY,
                credential)
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

}