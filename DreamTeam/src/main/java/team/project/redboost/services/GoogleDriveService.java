package team.project.redboost.services;

import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleRefreshTokenRequest;
// Correction: Utiliser GoogleNetHttpTransport est recommandé pour les applications Google
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
import org.slf4j.Logger; // Importation du logger SLF4J
import org.slf4j.LoggerFactory; // Importation du logger Factory SLF4J
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import team.project.redboost.repositories.UserRepository; // Assurez-vous que le chemin est correct

import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException; // Importation pour GoogleNetHttpTransport
import java.util.Collections;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
public class GoogleDriveService {

    // Ajout d'un logger
    private static final Logger logger = LoggerFactory.getLogger(GoogleDriveService.class);

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    // Mettez à jour le nom de l'application
    @Value("${spring.application.name:RedboostApp}") // Utilise le nom de l'app ou une valeur par défaut
    private String applicationName;


    @Autowired
    private UserRepository userRepository; // Assurez-vous que ce Repository existe et a les méthodes nécessaires

    // Méthode pour obtenir l'instance Drive. Ajout de GeneralSecurityException
    private Drive getDriveService(Long userId) throws IOException, GeneralSecurityException {
        String accessToken = getAccessToken(userId);
        logger.debug("Access Token obtenu pour l'utilisateur {}", userId);

        // Create GoogleCredentials using AccessToken
        AccessToken token = new AccessToken(accessToken, null); // Pas de date d'expiration nécessaire ici car il est de courte durée
        GoogleCredentials credentials = GoogleCredentials.create(token);

        // Utilisation de GoogleNetHttpTransport recommandé
        NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();

        return new Drive.Builder(
                httpTransport,
                JacksonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
                .setApplicationName(applicationName) // Utiliser le nom de l'application configuré
                .build();
    }

    // Méthode pour obtenir un Access Token via le Refresh Token
    public String getAccessToken(Long userId) throws IOException {
        logger.debug("Tentative de récupération du refresh token pour l'utilisateur {}", userId);
        // TODO: Gérer le cas où l'utilisateur n'existe pas dans la base
        String refreshToken = userRepository.findRefreshTokenById(userId); // Assurez-vous que cette méthode existe

        if (refreshToken == null || refreshToken.isEmpty()) {
            logger.error("Aucun refresh token trouvé pour l'utilisateur {} dans la base de données.", userId);
            throw new RuntimeException("L'utilisateur n'a pas autorisé l'accès à Google Drive ou le token n'est pas stocké.");
        }
        logger.debug("Refresh Token trouvé pour l'utilisateur {}", userId);

        try {
            // Utilisation de GoogleNetHttpTransport recommandé
            NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();

            TokenResponse tokenResponse = new GoogleRefreshTokenRequest(
                    httpTransport, // Utilisation du transport recommandé
                    JacksonFactory.getDefaultInstance(),
                    refreshToken,
                    clientId,
                    clientSecret)
                    .execute();

            logger.info("Nouveau Access Token généré avec succès pour l'utilisateur {}", userId);
            return tokenResponse.getAccessToken();
        } catch (GeneralSecurityException e) {
            logger.error("Erreur de sécurité lors de la création du transport HTTP : {}", e.getMessage(), e);
            throw new IOException("Erreur de sécurité lors de la création du transport HTTP", e);
        } catch (IOException e) {
            // Si le refresh token est invalide (révoqué, expiré?), Google renverra une erreur ici
            logger.error("Erreur lors du rafraîchissement du token pour l'utilisateur {}: {}. Le token est peut-être invalide ou révoqué.", userId, e.getMessage(), e);
            // TODO: Peut-être supprimer le refresh token invalide de la DB ici ?
            // userRepository.updateRefreshToken(userId, null); // Exemple
            throw new IOException("Impossible de rafraîchir le token d'accès Google Drive. L'utilisateur doit peut-être réautoriser l'application.", e);
        }
    }

    /**
     * Crée un dossier racine dans le Google Drive de l'utilisateur.
     * @param folderName Le nom du dossier à créer.
     * @param userId L'ID de l'utilisateur.
     * @return L'ID du dossier créé.
     * @throws IOException Si une erreur d'API ou de réseau survient.
     */
    public String createFolder(String folderName, Long userId) throws IOException {
        try {
            Drive driveService = getDriveService(userId);
            logger.info("Création du dossier racine '{}' pour l'utilisateur {}", folderName, userId);

            File folderMetadata = new File();
            folderMetadata.setName(folderName);
            folderMetadata.setMimeType("application/vnd.google-apps.folder");
            // Pas de parent spécifié => racine (ou dossier par défaut de l'app si scope différent)

            File folder = driveService.files().create(folderMetadata)
                    .setFields("id") // Demander seulement l'ID en retour
                    .execute();

            logger.info("Dossier racine '{}' créé avec succès avec l'ID {} pour l'utilisateur {}", folderName, folder.getId(), userId);
            return folder.getId();
        } catch (GeneralSecurityException e) {
            logger.error("Erreur de sécurité lors de la création du dossier pour l'utilisateur {}: {}", userId, e.getMessage(), e);
            throw new IOException("Erreur de sécurité interne lors de l'accès à Google Drive", e);
        } catch (IOException e) {
            logger.error("Erreur IO lors de la création du dossier '{}' pour l'utilisateur {}: {}", folderName, userId, e.getMessage(), e);
            throw e; // Relaie l'exception
        }
    }

    /**
     * Crée un sous-dossier dans un dossier parent spécifié dans le Google Drive de l'utilisateur.
     * @param subFolderName Le nom du sous-dossier à créer.
     * @param parentFolderId L'ID du dossier parent dans lequel créer le sous-dossier.
     * @param userId L'ID de l'utilisateur.
     * @return L'ID du sous-dossier créé.
     * @throws IOException Si une erreur d'API ou de réseau survient.
     */
    public String createSubFolder(String subFolderName, String parentFolderId, Long userId) throws IOException {
        try {
            Drive driveService = getDriveService(userId);
            logger.info("Création du sous-dossier '{}' dans le parent '{}' pour l'utilisateur {}", subFolderName, parentFolderId, userId);

            File folderMetadata = new File();
            folderMetadata.setName(subFolderName);
            folderMetadata.setMimeType("application/vnd.google-apps.folder");

            // --- Spécification du dossier parent ---
            folderMetadata.setParents(Collections.singletonList(parentFolderId));
            // ---------------------------------------

            File subFolder = driveService.files().create(folderMetadata)
                    .setFields("id") // Demande seulement l'ID en retour
                    .execute();

            logger.info("Sous-dossier '{}' créé avec succès avec l'ID {} dans le parent {} pour l'utilisateur {}", subFolderName, subFolder.getId(), parentFolderId, userId);
            return subFolder.getId();
        } catch (GeneralSecurityException e) {
            logger.error("Erreur de sécurité lors de la création du sous-dossier pour l'utilisateur {}: {}", userId, e.getMessage(), e);
            throw new IOException("Erreur de sécurité interne lors de l'accès à Google Drive", e);
        } catch (IOException e) {
            // Vérifier si l'erreur est due à un parentFolderId invalide (404 Not Found)
            if (e.getMessage() != null && e.getMessage().contains("404 Not Found")) {
                logger.error("Erreur lors de la création du sous-dossier '{}' pour l'utilisateur {}: Le dossier parent avec l'ID '{}' n'a pas été trouvé.", subFolderName, userId, parentFolderId, e);
                throw new IOException("Le dossier parent spécifié (" + parentFolderId + ") n'existe pas ou n'est pas accessible.", e);
            }
            logger.error("Erreur IO lors de la création du sous-dossier '{}' pour l'utilisateur {}: {}", subFolderName, userId, e.getMessage(), e);
            throw e; // Relaie l'exception
        }
    }

    /**
     * Upload un fichier dans un dossier spécifié.
     * @param folderId L'ID du dossier parent.
     * @param fileName Le nom à donner au fichier sur Google Drive.
     * @param fileContent Le contenu du fichier sous forme d'InputStream.
     * @param userId L'ID de l'utilisateur.
     * @return L'ID du fichier créé sur Google Drive.
     * @throws RuntimeException encapsulant une IOException en cas d'échec.
     */
    public String uploadFile(String folderId, String fileName, InputStream fileContent, Long userId) {
        try {
            Drive driveService = getDriveService(userId);
            logger.info("Upload du fichier '{}' dans le dossier '{}' pour l'utilisateur {}", fileName, folderId, userId);

            File fileMetadata = new File();
            fileMetadata.setName(fileName);
            // Spécifie le dossier parent pour l'upload
            fileMetadata.setParents(Collections.singletonList(folderId));

            // Déterminer le type MIME serait mieux, mais octet-stream est un fallback sûr.
            // Vous pourriez utiliser Tika ou une autre librairie pour détecter le type MIME à partir du nom ou du contenu.
            InputStreamContent mediaContent = new InputStreamContent(null, fileContent); // null pour laisser Google Drive deviner, ou "application/octet-stream"

            File file = driveService.files().create(fileMetadata, mediaContent)
                    .setFields("id") // Récupérer l'ID du fichier créé
                    .execute();

            logger.info("Fichier '{}' uploadé avec succès avec l'ID {} dans le dossier {} pour l'utilisateur {}", fileName, file.getId(), folderId, userId);
            return file.getId();
        } catch (GeneralSecurityException e) {
            logger.error("Erreur de sécurité lors de l'upload du fichier '{}' pour l'utilisateur {}: {}", fileName, userId, e.getMessage(), e);
            throw new RuntimeException("Erreur de sécurité interne lors de l'accès à Google Drive pour l'upload", e);
        } catch (IOException e) {
            // Vérifier si l'erreur est due à un folderId invalide (404 Not Found)
            if (e.getMessage() != null && e.getMessage().contains("404 Not Found")) {
                logger.error("Erreur lors de l'upload du fichier '{}' pour l'utilisateur {}: Le dossier parent avec l'ID '{}' n'a pas été trouvé.", fileName, userId, folderId, e);
                throw new RuntimeException("Le dossier de destination (" + folderId + ") n'existe pas ou n'est pas accessible.", e);
            }
            logger.error("Erreur IO lors de l'upload du fichier '{}' pour l'utilisateur {}: {}", fileName, userId, e.getMessage(), e);
            // Encapsuler IOException dans une RuntimeException pour simplifier la signature du contrôleur,
            // mais envisagez une exception personnalisée plus spécifique.
            throw new RuntimeException("Échec de l'upload du fichier vers Google Drive", e);
        }
    }

    /**
     * Récupère la liste des dossiers directement sous la racine ('root') du Drive de l'utilisateur.
     * @param userId L'ID de l'utilisateur.
     * @return Une liste de Map, chaque Map contenant 'id' et 'name' d'un dossier racine.
     * @throws IOException Si une erreur d'API ou de réseau survient.
     */

    // GoogleDriveService.java

    public List<Map<String, String>> getSubFoldersList(String parentFolderId, Long userId) throws IOException {
        try {
            Drive driveService = getDriveService(userId);
            logger.info("Récupération des sous-dossiers pour le parent {} et l'utilisateur {}", parentFolderId, userId);

            String query = String.format(
                    "mimeType = 'application/vnd.google-apps.folder' and '%s' in parents and trashed = false",
                    parentFolderId
            );

            FileList result = driveService.files().list()
                    .setQ(query)
                    .setOrderBy("name")
                    .setFields("files(id, name, mimeType)")
                    .execute();

            List<Map<String, String>> items = new ArrayList<>();
            if (result.getFiles() != null) {
                for (File file : result.getFiles()) {
                    Map<String, String> itemInfo = new HashMap<>();
                    itemInfo.put("id", file.getId());
                    itemInfo.put("name", file.getName());
                    itemInfo.put("mimeType", file.getMimeType());
                    items.add(itemInfo);
                }
            }
            return items;
        } catch (GeneralSecurityException e) {
            logger.error("Erreur de sécurité", e);
            throw new IOException("Erreur de sécurité", e);
        }
    }
    public List<Map<String, String>> getFoldersList(Long userId) throws IOException {
        try {
            Drive driveService = getDriveService(userId);
            logger.info("Récupération des dossiers racines pour l'utilisateur {}", userId);

            // Query pour les dossiers directement sous 'root', non supprimés.
            String query = "mimeType = 'application/vnd.google-apps.folder' and 'root' in parents and trashed = false";
            FileList result = driveService.files().list()
                    .setQ(query)
                    // Ajout de orderBy pour un tri cohérent
                    .setOrderBy("name")
                    // Champs nécessaires: id et name
                    .setFields("files(id, name)")
                    .execute();

            List<Map<String, String>> folderList = new ArrayList<>();
            if (result.getFiles() != null) {
                for (File file : result.getFiles()) {
                    Map<String, String> folderInfo = new HashMap<>();
                    folderInfo.put("id", file.getId());
                    folderInfo.put("name", file.getName());
                    folderList.add(folderInfo);
                    logger.debug("Dossier racine trouvé: Name={}, ID={}", file.getName(), file.getId());
                }
            }
            logger.info("{} dossiers racines trouvés pour l'utilisateur {}", folderList.size(), userId);
            return folderList;
        } catch (GeneralSecurityException e) {
            logger.error("Erreur de sécurité lors de la récupération des dossiers pour l'utilisateur {}: {}", userId, e.getMessage(), e);
            throw new IOException("Erreur de sécurité interne lors de l'accès à Google Drive", e);
        } catch (IOException e) {
            logger.error("Erreur IO lors de la récupération des dossiers pour l'utilisateur {}: {}", userId, e.getMessage(), e);
            throw e; // Relaie l'exception
        }
    }

    /**
     * Stocke ou met à jour le refresh token pour un utilisateur donné.
     * @param userId L'ID de l'utilisateur.
     * @param refreshToken Le refresh token à stocker.
     */
    public void storeRefreshToken(Long userId, String refreshToken) {
        // TODO: Ajouter une validation pour s'assurer que userId et refreshToken ne sont pas null
        if (userId == null || refreshToken == null || refreshToken.isEmpty()) {
            logger.error("Tentative de stockage d'un refresh token invalide. UserID: {}, Token est vide: {}", userId, refreshToken == null || refreshToken.isEmpty());
            // Ne pas lancer d'exception ici car cela pourrait bloquer le flux OAuth, mais logger est essentiel.
            // Vous pourriez vouloir retourner une indication d'échec au contrôleur si nécessaire.
            return;
        }
        try {
            // Assurez-vous que la méthode updateRefreshToken existe dans votre UserRepository
            // et qu'elle gère correctement la mise à jour ou l'insertion.
            // Exemple: find User by ID, set refresh token, save User.
            userRepository.updateRefreshToken(userId, refreshToken); // Adaptez à votre implémentation réelle
            logger.info("Refresh Token stocké/mis à jour avec succès pour l'utilisateur {}", userId);
        } catch (Exception e) {
            // Capturer les exceptions potentielles de la base de données
            logger.error("Échec du stockage du refresh token pour l'utilisateur {} dans la base de données: {}", userId, e.getMessage(), e);
            // Gérer l'erreur - peut-être lancer une exception personnalisée ?
            // throw new RuntimeException("Erreur lors de la sauvegarde du token en base de données", e);
        }
    }
}