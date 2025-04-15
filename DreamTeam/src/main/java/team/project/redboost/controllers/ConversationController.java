package team.project.redboost.controllers;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import team.project.redboost.dto.ConversationDTO;

import team.project.redboost.entities.Conversation;
import team.project.redboost.entities.User;
import team.project.redboost.repositories.ConversationRepository;
import team.project.redboost.services.ConversationService;
import team.project.redboost.services.UserService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;
    private final UserService userService;
    private final ConversationRepository conversationRepository;//

    @PostMapping("/private")
    public ResponseEntity<ConversationDTO> createPrivateConversation(
            @RequestBody ConversationDTO.CreatePrivateConversationRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        User currentUser = userService.findByEmail(userEmail);
        Long currentUserId = currentUser.getId();
        Conversation conversation = conversationService.createPrivateConversation(
                currentUserId,
                request.getRecipientId()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(conversation));
    }

    @PostMapping("/group")
    public ResponseEntity<ConversationDTO> createGroupConversation(
            @RequestBody ConversationDTO.CreateGroupRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        User currentUser = userService.findByEmail(userEmail);
        Long currentUserId = currentUser.getId();
        Conversation conversation = conversationService.createGroupConversation(
                request.getName(),
                currentUserId,
                request.getMemberIds()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(conversation));
    }

    @GetMapping
    public ResponseEntity<List<ConversationDTO>> getUserConversations(
            Authentication authentication) {
        try {
            // Get current user email from authentication
            String userEmail = authentication.getName();

            // Find user by email
            User currentUser = userService.findByEmail(userEmail);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            // Get conversations from repository (ordered by most recent message)
            List<Conversation> conversations = conversationRepository.findAllUserConversations(currentUser);

            // Convert to DTOs and return
            List<ConversationDTO> conversationDTOs = conversations.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(conversationDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConversationDTO> getConversation(
            @PathVariable Long id,
            Authentication authentication) {
        // Cette méthode devrait également être implémentée dans votre service

        // Long currentUserId = Long.parseLong(authentication.getName());
        // Conversation conversation = conversationService.getConversation(id, currentUserId);
        // return ResponseEntity.ok(convertToDTO(conversation));

        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    // Méthode utilitaire pour convertir Conversation en ConversationDTO
    private ConversationDTO convertToDTO(Conversation conversation) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(conversation.getId());
        dto.setTitre(conversation.getTitre());
        dto.setEstGroupe(conversation.isEstGroupe());

        if (conversation.getCreator() != null) {
            dto.setCreatorId(conversation.getCreator().getId());
        }

        dto.setParticipantIds(conversation.getParticipants().stream()
                .map(user -> user.getId())
                .collect(Collectors.toSet()));

        return dto;
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteConversation(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName(); // Récupère l'email directement
            User currentUser = userService.findByEmail(userEmail); // Cherche l'utilisateur par email

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            conversationService.deleteConversation(id, currentUser.getId()); // Passe l'ID utilisateur
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur: " + e.getMessage());
        }
    }
}