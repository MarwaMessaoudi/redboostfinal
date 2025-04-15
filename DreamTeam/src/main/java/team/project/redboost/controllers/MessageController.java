package team.project.redboost.controllers;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team.project.redboost.dto.MessageDTO;
import team.project.redboost.entities.Message;
import team.project.redboost.services.MessageService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    // DTO pour les requêtes d'envoi de message privé
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrivateMessageRequest {
        private Long senderId;
        private Long recipientId;
        private String content;
    }

    // DTO pour les requêtes d'envoi de message de groupe
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupMessageRequest {
        private Long senderId;
        private Long conversationId;
        private String content;
    }

    // DTO pour la mise à jour de message
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateMessageRequest {
        private Long userId;
        private String newContent;
    }

    @PostMapping("/private")
    public ResponseEntity<MessageDTO> sendPrivateMessage(
            @RequestBody PrivateMessageRequest request) {

        Message message = messageService.sendPrivateMessage(
                request.getSenderId(),
                request.getRecipientId(),
                request.getContent()
        );
        return ResponseEntity.ok(convertToDTO(message));
    }

    @PostMapping("/group")
    public ResponseEntity<MessageDTO> sendGroupMessage(
            @RequestBody GroupMessageRequest request) {

        Message message = messageService.sendGroupMessage(
                request.getSenderId(),
                request.getConversationId(),
                request.getContent()
        );
        return ResponseEntity.ok(convertToDTO(message));
    }

    @GetMapping("/private")
    public ResponseEntity<List<MessageDTO>> getPrivateConversation(
            @RequestParam Long user1Id,
            @RequestParam Long user2Id) {

        List<Message> messages = messageService.getPrivateConversation(user1Id, user2Id);
        return ResponseEntity.ok(messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList()));
    }

    @GetMapping("/group/{conversationId}")
    public ResponseEntity<List<MessageDTO>> getGroupConversation(
            @PathVariable Long conversationId) {

        List<Message> messages = messageService.getGroupConversation(conversationId);
        return ResponseEntity.ok(messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList()));
    }

    @PutMapping("/mark-as-read")
    public ResponseEntity<Void> markMessagesAsRead(
            @RequestBody List<Long> messageIds,
            @RequestParam Long userId) {

        messageService.markMessagesAsRead(messageIds, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread/{userId}")
    public ResponseEntity<List<MessageDTO>> getUnreadMessages(
            @PathVariable Long userId) {

        List<Message> messages = messageService.getUnreadMessages(userId);
        return ResponseEntity.ok(messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList()));
    }


    @PutMapping("/{messageId}")
    public ResponseEntity<MessageDTO> updateMessage(
            @PathVariable Long messageId,
            @RequestBody UpdateMessageRequest request) {

        Message updatedMessage = messageService.updateMessage(
                messageId,
                request.getUserId(),
                request.getNewContent()
        );
        return ResponseEntity.ok(convertToDTO(updatedMessage));
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long messageId,
            @RequestParam Long userId) {

        messageService.deleteMessage(messageId, userId);
        return ResponseEntity.ok().build();
    }

    private MessageDTO convertToDTO(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .content(message.getContent())
                .timestamp(message.getDateEnvoi())
                .isRead(message.isEstLu())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getUsername())
                .senderAvatar(message.getSender().getProfilePictureUrl())
                .recipientId(message.getRecipient() != null ? message.getRecipient().getId() : null)
                .conversationId(message.getConversation() != null ? message.getConversation().getId() : null)
                .build();
    }

    @GetMapping("/{messageId}")
    public ResponseEntity<MessageDTO> getMessageById(
            @PathVariable Long messageId) {

        Message message = messageService.getMessageById(messageId)
                .orElseThrow(() -> new RuntimeException("Message non trouvé"));

        return ResponseEntity.ok(convertToDTO(message));
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<MessageDTO>> getConversationMessages(
            @PathVariable Long conversationId,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {

        List<Message> messages;

        if (page != null && size != null) {
            messages = messageService.getAllMessagesByConversationId(
                    conversationId,
                    PageRequest.of(page, size, Sort.by("dateEnvoi").ascending())
            );
        } else {
            messages = messageService.getAllMessagesByConversationId(conversationId);
        }

        return ResponseEntity.ok(messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList()));
    }

}