package team.project.redboost.services;

import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleRefreshTokenRequest;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.InputStreamContent;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import team.project.redboost.repositories.UserRepository;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;

@Service
public class GoogleDriveService {

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    @Autowired
    private UserRepository userRepository;

    public String getAccessToken(Long userId) throws IOException {
        // Retrieve the refresh token from the database
        String refreshToken = userRepository.findRefreshTokenById(userId);

        if (refreshToken == null) {
            throw new RuntimeException("User has not granted access to Google Drive");
        }

        // Use the refresh token to get a new access token
        TokenResponse tokenResponse = new GoogleRefreshTokenRequest(
                new NetHttpTransport(),
                JacksonFactory.getDefaultInstance(),
                refreshToken,
                clientId,
                clientSecret)
                .execute();

        return tokenResponse.getAccessToken();
    }

    public String createFolder(String folderName, Long userId) throws IOException {
        String accessToken = getAccessToken(userId);

        // Create GoogleCredentials using AccessToken
        AccessToken token = new AccessToken(accessToken, null); // No expiration time provided
        GoogleCredentials credentials = GoogleCredentials.create(token);

        Drive driveService = new Drive.Builder(
                new NetHttpTransport(),
                JacksonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("MyDriveApp")
                .build();

        File folderMetadata = new File();
        folderMetadata.setName(folderName);
        folderMetadata.setMimeType("application/vnd.google-apps.folder");

        File folder = driveService.files().create(folderMetadata)
                .setFields("id")
                .execute();

        return folder.getId();
    }

    public String uploadFile(String folderId, String fileName, InputStream fileContent, Long userId) throws IOException {
        String accessToken = getAccessToken(userId);

        // Create GoogleCredentials using AccessToken
        AccessToken token = new AccessToken(accessToken, null); // No expiration time provided
        GoogleCredentials credentials = GoogleCredentials.create(token);

        Drive driveService = new Drive.Builder(
                new NetHttpTransport(),
                JacksonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("MyDriveApp")
                .build();

        File fileMetadata = new File();
        fileMetadata.setName(fileName);
        fileMetadata.setParents(Collections.singletonList(folderId));

        File file = driveService.files().create(fileMetadata, new InputStreamContent("application/octet-stream", fileContent))
                .setFields("id")
                .execute();

        return file.getId();
    }


    public void storeRefreshToken(Long userId, String refreshToken) {
        userRepository.updateRefreshToken(userId, refreshToken);
    }
}