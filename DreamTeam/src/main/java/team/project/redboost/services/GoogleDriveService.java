package team.project.redboost.services;

import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleRefreshTokenRequest;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.InputStreamContent;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
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
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
public class GoogleDriveService {

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    @Autowired
    private UserRepository userRepository;

    private Drive getDriveService(Long userId) throws IOException {
        String accessToken = getAccessToken(userId);

        // Create GoogleCredentials using AccessToken
        AccessToken token = new AccessToken(accessToken, null); // No expiration time provided
        GoogleCredentials credentials = GoogleCredentials.create(token);

        return new Drive.Builder(
                new NetHttpTransport(),
                JacksonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("MyDriveApp")
                .build();
    }

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
        Drive driveService = getDriveService(userId);

        File folderMetadata = new File();
        folderMetadata.setName(folderName);
        folderMetadata.setMimeType("application/vnd.google-apps.folder");

        File folder = driveService.files().create(folderMetadata)
                .setFields("id")
                .execute();

        return folder.getId();
    }

    public String uploadFile(String folderId, String fileName, InputStream fileContent, Long userId) {
        try {
            Drive driveService = getDriveService(userId);

            File fileMetadata = new File();
            fileMetadata.setName(fileName);
            fileMetadata.setParents(Collections.singletonList(folderId));

            InputStreamContent mediaContent = new InputStreamContent("application/octet-stream", fileContent);

            File file = driveService.files().create(fileMetadata, mediaContent)
                    .setFields("id")
                    .execute();

            return file.getId();
        } catch (IOException e) {
            // Log the exception
            e.printStackTrace();
            throw new RuntimeException("Failed to upload file to Google Drive", e);
        }
    }

    public List<Map<String, String>> getFoldersList(Long userId) throws IOException {
        Drive driveService = getDriveService(userId);
        // Query for folders
        String query = "mimeType = 'application/vnd.google-apps.folder' and 'root' in parents and trashed = false";
        FileList result = driveService.files().list()
                .setQ(query)
                .setFields("files(id, name)")
                .execute();

        List<Map<String, String>> folderList = new ArrayList<>();
        for (File file : result.getFiles()) {
            Map<String, String> folderInfo = new HashMap<>();
            folderInfo.put("id", file.getId());
            folderInfo.put("name", file.getName());
            folderList.add(folderInfo);
        }

        return folderList;
    }


    public void storeRefreshToken(Long userId, String refreshToken) {
        userRepository.updateRefreshToken(userId, refreshToken);
    }
}