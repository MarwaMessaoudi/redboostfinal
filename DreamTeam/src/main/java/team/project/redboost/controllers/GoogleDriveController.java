package team.project.redboost.controllers;

import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import team.project.redboost.services.GoogleDriveService;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@RestController
@RequestMapping("/api/drive")
public class GoogleDriveController {

    @Autowired
    private GoogleDriveService googleDriveService;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    // Step 1: Redirect the user to Google's OAuth2 consent screen
    @GetMapping("/authorize")
    public void authorize(@RequestParam Long userId, HttpServletResponse response, HttpSession session) throws IOException {
        // Store userId in the session
        session.setAttribute("userId", userId);

        String authorizationUrl = "https://accounts.google.com/o/oauth2/auth?"
                + "client_id=" + clientId + "&"
                + "redirect_uri=http://localhost:8085/api/drive/callback&"
                + "response_type=code&"
                + "scope=https://www.googleapis.com/auth/drive.file&"
                + "access_type=offline&"
                + "prompt=consent";

        response.sendRedirect(authorizationUrl);
    }

    // Step 2: Handle the OAuth2 callback and store the refresh token
    @GetMapping("/callback")
    public String callback(@RequestParam String code, HttpSession session) throws IOException {
        // Retrieve userId from the session
        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            throw new RuntimeException("User ID not found in session");
        }

        // Exchange the authorization code for an access token and refresh token
        TokenResponse tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                new NetHttpTransport(),
                JacksonFactory.getDefaultInstance(),
                "https://oauth2.googleapis.com/token",
                clientId,
                clientSecret,
                code,
                "http://localhost:8085/api/drive/callback")
                .execute();

        // Store the refresh token in the database
        googleDriveService.storeRefreshToken(userId, tokenResponse.getRefreshToken());

        return "Google Drive access granted!";
    }


    // Step 3: Create a folder in the user's Google Drive
    @PostMapping("/create-folder")
    public String createFolder(@RequestParam String folderName, @RequestParam Long userId) throws IOException {
        return googleDriveService.createFolder(folderName, userId);
    }

    // Step 4: Upload a file to the user's Google Drive
    @PostMapping("/upload-file")
    public String uploadFile(@RequestParam String folderId, @RequestParam String fileName, @RequestParam MultipartFile file, @RequestParam Long userId) throws IOException {
        return googleDriveService.uploadFile(folderId, fileName, file.getInputStream(), userId);
    }
}