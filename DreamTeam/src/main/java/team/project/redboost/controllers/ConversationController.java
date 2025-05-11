package team.project.redboost.controllers;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import team.project.redboost.dto.ConversationDTO;
import team.project.redboost.dto.ConversationDTO.UserDetails;
import team.project.redboost.dto.ConversationDTO.NonMemberUser;
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
    private final ConversationRepository conversationRepository;

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

        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(conversation, false));
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

        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(conversation, false));
    }

    @GetMapping
    public ResponseEntity<List<ConversationDTO>> getUserConversations(
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User currentUser = userService.findByEmail(userEmail);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            List<Conversation> conversations = conversationRepository.findAllUserConversations(currentUser);
            List<ConversationDTO> conversationDTOs = conversations.stream()
                    .map(conv -> convertToDTO(conv, false))
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
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteConversation(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User currentUser = userService.findByEmail(userEmail);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            conversationService.deleteConversation(id, currentUser.getId());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/members")
    public ResponseEntity<ConversationDTO> addMemberToConversation(
            @PathVariable Long id,
            @RequestBody ConversationDTO.AddMemberRequest request,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User currentUser = userService.findByEmail(userEmail);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            Conversation updatedConversation = conversationService.addMemberToConversation(
                    id,
                    currentUser.getId(),
                    request.getMemberId()
            );

            return ResponseEntity.ok(convertToDTO(updatedConversation, true));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<UserDetails>> getGroupMembers(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User currentUser = userService.findByEmail(userEmail);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            List<User> members = conversationService.getGroupMembers(id, currentUser.getId());
            List<UserDetails> memberDetails = members.stream()
                    .map(user -> {
                        UserDetails details = new UserDetails();
                        details.setId(user.getId());
                        details.setFirstName(user.getFirstName());
                        details.setLastName(user.getLastName());
                        details.setRole(user.getRole() != null ? user.getRole().toString() : "Utilisateur()");
                        String profilePictureUrl = user.getProfilePictureUrl();
                        details.setProfilePictureUrl(profilePictureUrl);
                        System.out.println("User ID: " + user.getId() + ", Profile Picture URL: " + profilePictureUrl);
                        return details;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(memberDetails);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}/non-members")
    public ResponseEntity<List<NonMemberUser>> getNonMembers(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User currentUser = userService.findByEmail(userEmail);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            List<User> nonMembers = conversationService.getNonMembers(id, currentUser.getId());
            List<NonMemberUser> nonMemberDetails = nonMembers.stream()
                    .map(user -> {
                        NonMemberUser details = new NonMemberUser();
                        details.setId(user.getId());
                        details.setFirstName(user.getFirstName());
                        details.setLastName(user.getLastName());
                        details.setRole(user.getRole() != null ? user.getRole().toString() : "Utilisateur");
                        return details;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(nonMemberDetails);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<?> leaveGroupConversation(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            User currentUser = userService.findByEmail(userEmail);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            conversationService.leaveGroupConversation(id, currentUser.getId());
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Conversation or user not found");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    private ConversationDTO convertToDTO(Conversation conversation, boolean includeMembers) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(conversation.getId());
        dto.setTitre(conversation.getTitre());
        dto.setEstGroupe(conversation.isEstGroupe());

        if (conversation.getCreator() != null) {
            dto.setCreatorId(conversation.getCreator().getId());
        }

        dto.setParticipantIds(conversation.getParticipants().stream()
                .map(User::getId)
                .collect(Collectors.toSet()));

        if (includeMembers && conversation.isEstGroupe()) {
            dto.setMembers(conversation.getParticipants().stream()
                    .map(user -> {
                        UserDetails details = new UserDetails();
                        details.setId(user.getId());
                        details.setFirstName(user.getFirstName());
                        details.setLastName(user.getLastName());
                        details.setRole(user.getRole() != null ? user.getRole().toString() : "Utilisateur");
                        return details;
                    })
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}