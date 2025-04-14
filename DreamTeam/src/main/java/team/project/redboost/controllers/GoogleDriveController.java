package team.project.redboost.controllers;

import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
// Suppression de l'import FileList et File ici car non directement utilisés dans le contrôleur après refactoring
// import com.google.api.services.drive.model.FileList;
// import com.google.api.services.drive.model.File;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import team.project.redboost.services.GoogleDriveService;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
// Suppression de l'import ArrayList ici car getFolders retourne directement List<Map<...>>
// import java.util.ArrayList;
// Suppression de l'import HashMap ici car getFolders retourne directement List<Map<...>>
// import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
                + "redirect_uri=http://localhost:8085/api/drive/callback&" // Assurez-vous que cette URI est enregistrée dans Google Cloud Console
                + "response_type=code&"
                + "scope=https://www.googleapis.com/auth/drive.file&" // drive.file permet de créer/modifier les fichiers créés par l'app
                + "access_type=offline&" // Important pour obtenir un refresh token
                + "prompt=consent"; // Force l'écran de consentement pour obtenir le refresh token à chaque fois (utile en dev)

        response.sendRedirect(authorizationUrl);
    }

    // GoogleDriveController.java

    @GetMapping("/subfolders")
    public List<Map<String, String>> getSubFolders(
            @RequestParam String parentFolderId,
            @RequestParam Long userId) throws IOException {

        return googleDriveService.getSubFoldersList(parentFolderId, userId);
    }

    // Step 2: Handle the OAuth2 callback and store the refresh token
    @GetMapping("/callback")
    public String callback(@RequestParam String code, HttpSession session) throws IOException {
        // Retrieve userId from the session
        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            // Peut-être rediriger vers une page d'erreur ou retourner un message JSON
            session.removeAttribute("userId"); // Nettoyer la session
            return "Erreur: ID utilisateur non trouvé dans la session. Veuillez réessayer le processus d'autorisation.";
            // throw new RuntimeException("User ID not found in session");
        }
        session.removeAttribute("userId"); // Nettoyer la session après récupération

        try {
            // Exchange the authorization code for an access token and refresh token
            TokenResponse tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                    new NetHttpTransport(),
                    JacksonFactory.getDefaultInstance(),
                    "https://oauth2.googleapis.com/token",
                    clientId,
                    clientSecret,
                    code,
                    "http://localhost:8085/api/drive/callback") // Doit correspondre exactement à l'URI de redirection
                    .execute();

            String refreshToken = tokenResponse.getRefreshToken();
            if (refreshToken == null || refreshToken.isEmpty()) {
                return "Erreur: Aucun refresh token reçu de Google. Assurez-vous que 'access_type=offline' et 'prompt=consent' sont utilisés lors de l'autorisation, et que l'utilisateur n'a pas déjà autorisé l'application sans ces paramètres.";
            }

            // Store the refresh token in the database
            googleDriveService.storeRefreshToken(userId, refreshToken);

            // Vous pourriez rediriger l'utilisateur vers une page de succès de votre application frontend
            return "Accès à Google Drive autorisé avec succès ! Vous pouvez fermer cet onglet.";

        } catch (IOException e) {
            System.err.println("Erreur lors de l'échange du code d'autorisation : " + e.getMessage());
            e.printStackTrace();
            return "Erreur lors de la communication avec Google pour obtenir le token.";
        }
    }


    /**
     * Crée un dossier racine dans le Google Drive de l'utilisateur.
     * @param folderName Nom du dossier racine.
     * @param userId ID de l'utilisateur.
     * @return ID du dossier créé.
     * @throws IOException En cas d'erreur API ou réseau.
     */
    @PostMapping("/create-folder")
    public String createFolder(@RequestParam String folderName, @RequestParam Long userId) throws IOException {
        // TODO: Ajouter une validation pour folderName (non vide, caractères autorisés ?)
        if (folderName == null || folderName.trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom du dossier ne peut pas être vide.");
        }
        return googleDriveService.createFolder(folderName, userId);
    }

    /**
     * Crée un sous-dossier dans un dossier parent spécifié.
     * @param parentFolderId ID du dossier parent.
     * @param subFolderName Nom du nouveau sous-dossier.
     * @param userId ID de l'utilisateur.
     * @return ID du sous-dossier créé.
     * @throws IOException En cas d'erreur API ou réseau.
     */
    @PostMapping("/create-subfolder") // Nouvel endpoint
    public String createSubFolder(
            @RequestParam String parentFolderId, // ID du dossier parent
            @RequestParam String subFolderName,  // Nom du sous-dossier
            @RequestParam Long userId) throws IOException {
        // TODO: Ajouter des validations pour les paramètres
        if (parentFolderId == null || parentFolderId.trim().isEmpty()) {
            throw new IllegalArgumentException("L'ID du dossier parent ne peut pas être vide.");
        }
        if (subFolderName == null || subFolderName.trim().isEmpty()) {
            throw new IllegalArgumentException("Le nom du sous-dossier ne peut pas être vide.");
        }
        // Appelle la nouvelle méthode dans le service
        return googleDriveService.createSubFolder(subFolderName, parentFolderId, userId);
    }


    /**
     * Upload un fichier dans un dossier spécifique du Google Drive de l'utilisateur.
     * @param folderId ID du dossier de destination.
     * @param file Fichier multipart reçu de la requête.
     * @param userId ID de l'utilisateur.
     * @return ID du fichier créé sur Google Drive.
     * @throws IOException En cas d'erreur d'upload ou d'API.
     */
    @PostMapping("/upload-file")
    public String uploadFile(@RequestParam String folderId, @RequestParam MultipartFile file, @RequestParam Long userId) throws IOException {
        // TODO: Ajouter des validations pour les paramètres
        if (folderId == null || folderId.trim().isEmpty()) {
            throw new IllegalArgumentException("L'ID du dossier ne peut pas être vide.");
        }
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier à uploader ne peut pas être vide.");
        }
        String originalFileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "fichier_sans_nom";
        return googleDriveService.uploadFile(folderId, originalFileName, file.getInputStream(), userId);
    }

    /**
     * Récupère la liste des dossiers racines de l'utilisateur.
     * @param userId ID de l'utilisateur.
     * @return Liste des dossiers (ID et nom).
     * @throws IOException En cas d'erreur API ou réseau.
     */
    @GetMapping("/folders")
    public List<Map<String, String>> getFolders(@RequestParam Long userId) throws IOException {
        // Note: Ceci ne liste que les dossiers racines.
        // Pour lister les sous-dossiers d'un dossier spécifique,
        // il faudrait une autre méthode (ou adapter celle-ci avec un paramètre optionnel parentFolderId)
        // et modifier la query dans le service ('parentFolderId' in parents).
        return googleDriveService.getFoldersList(userId);
    }

    // TODO: Ajouter la gestion des erreurs (par exemple avec @ExceptionHandler) pour retourner des réponses HTTP appropriées en cas d'erreur (400, 401, 404, 500...).
}
