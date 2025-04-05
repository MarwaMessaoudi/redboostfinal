package team.project.redboost.services;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringReader;
import java.security.GeneralSecurityException;
import java.util.Base64;
import java.util.Collections;
import java.util.Properties;

@Service
public class EmailService {

    private static final String CLIENT_ID = "717073407944-pmbmhmhpdg3jove9da1582o9ihl2itat.apps.googleusercontent.com";
    private static final String CLIENT_SECRET = "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";
    private static final String REFRESH_TOKEN = "1//04wlhZI1aBvKZCgYIARAAGAQSNwF-L9IrS56Bo5a4BpDwyfEbb9j4umpp8OWxZGKL5UNYXyqsxNcnSmLeQvUIHNYCHzqlU_9Z6A0";
    private static final String USER_EMAIL = "messaoudimarwa75@gmail.com";
    private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final HttpTransport httpTransport;
    private Credential credential;

    public EmailService() throws GeneralSecurityException, IOException {
        this.httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        this.credential = getCredentials();
    }

    /**
     * Generates a Credential object using the Refresh Token with retry logic
     */
    private Credential getCredentials() throws IOException {
        GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(
                JSON_FACTORY,
                new StringReader("{\"installed\":{\"client_id\":\"" + CLIENT_ID + "\",\"client_secret\":\"" + CLIENT_SECRET + "\"}}")
        );

        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                httpTransport, JSON_FACTORY, clientSecrets,
                Collections.singletonList("https://www.googleapis.com/auth/gmail.send")
        ).build();

        Credential credential = flow.createAndStoreCredential(new GoogleTokenResponse().setRefreshToken(REFRESH_TOKEN), null);
        refreshCredentialWithRetry(credential, 3, 1000); // Retry 3 times with 1-second initial delay
        return credential;
    }

    /**
     * Refreshes the credential with retry logic and exponential backoff
     */
    private void refreshCredentialWithRetry(Credential credential, int maxRetries, long initialDelay) throws IOException {
        int attempt = 0;
        while (attempt < maxRetries) {
            try {
                if (credential.refreshToken()) {
                    logger.info("Token refreshed successfully on attempt {}", attempt + 1);
                    return;
                }
            } catch (IOException e) {
                if (e.getMessage().contains("invalid_grant")) {
                    logger.warn("Refresh token expired or revoked on attempt {}: {}", attempt + 1, e.getMessage());
                } else {
                    logger.error("Unexpected error refreshing token on attempt {}: {}", attempt + 1, e.getMessage());
                }
                attempt++;
                if (attempt < maxRetries) {
                    long delay = initialDelay * (long) Math.pow(2, attempt - 1); // Exponential backoff
                    try {
                        Thread.sleep(delay);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new IOException("Interrupted during retry delay", ie);
                    }
                }
            }
        }
        logger.error("Failed to refresh token after {} attempts. Email service will operate in degraded mode.", maxRetries);
        this.credential = null; // Set to null to indicate failure
    }

    /**
     * Creates the Gmail service
     */
    private Gmail getGmailService() throws IOException {
        if (credential == null) {
            throw new IOException("Credential is unavailable due to repeated refresh failures.");
        }
        return new Gmail.Builder(httpTransport, JSON_FACTORY, credential)
                .setApplicationName("MyApp")
                .build();
    }

    /**
     * Sends an email via Gmail API with fallback handling
     */
    public void sendEmail(String to, String subject, String body) throws MessagingException {
        try {
            Gmail gmail = getGmailService();
            MimeMessage mimeMessage = createEmail(to, USER_EMAIL, subject, body);
            Message message = createMessageWithEmail(mimeMessage);
            gmail.users().messages().send(USER_EMAIL, message).execute();
            logger.info("Email sent successfully to {}", to);
        } catch (IOException e) {
            logger.error("Failed to send email to {}: {}", to, e.getMessage());
            if (e.getMessage().contains("invalid_grant")) {
                try {
                    refreshCredentialWithRetry(credential, 3, 1000); // Retry refreshing token
                    Gmail gmail = getGmailService();
                    MimeMessage mimeMessage = createEmail(to, USER_EMAIL, subject, body);
                    Message message = createMessageWithEmail(mimeMessage);
                    gmail.users().messages().send(USER_EMAIL, message).execute();
                    logger.info("Email sent successfully to {} after token refresh", to);
                } catch (IOException ex) {
                    logger.error("Failed to send email after retrying token refresh: {}. Operating in degraded mode.", ex.getMessage());
                    // Fallback: Log the email instead of crashing
                    logEmailFailure(to, subject, body);
                }
            } else {
                logger.error("Unexpected error sending email: {}", e.getMessage());
                logEmailFailure(to, subject, body);
            }
        }
    }

    /**
     * Logs email failure as a fallback mechanism
     */
    private void logEmailFailure(String to, String subject, String body) {
        logger.warn("Email could not be sent. Details logged instead: To={}, Subject={}, Body={}", to, subject, body);
        // Optionally, save to a database or file for later retry
    }

    /**
     * Creates a formatted MIME email
     */
    private MimeMessage createEmail(String to, String from, String subject, String bodyText) throws MessagingException {
        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);
        MimeMessage email = new MimeMessage(session);
        email.setFrom(new InternetAddress(from));
        email.addRecipient(jakarta.mail.Message.RecipientType.TO, new InternetAddress(to));
        email.setSubject(subject);
        email.setText(bodyText);
        return email;
    }

    /**
     * Encodes a MIME email in base64
     */
    private Message createMessageWithEmail(MimeMessage email) throws MessagingException, IOException {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        email.writeTo(buffer);
        byte[] bytes = buffer.toByteArray();
        String encodedEmail = Base64.getUrlEncoder().encodeToString(bytes);
        Message message = new Message();
        message.setRaw(encodedEmail);
        return message;
    }
}