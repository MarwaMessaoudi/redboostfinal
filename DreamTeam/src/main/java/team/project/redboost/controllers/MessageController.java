package team.project.redboost.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team.project.redboost.dto.MessageDTO;
import team.project.redboost.dto.ReactionMessageDTO;
import team.project.redboost.entities.Message;
import team.project.redboost.entities.User;
import team.project.redboost.services.MessageService;
import team.project.redboost.services.UserService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserService userService;

    @PostMapping("/private")
    public ResponseEntity<MessageDTO> sendPrivateMessage(
            @RequestBody PrivateMessageRequest request) {
        Message message = messageService.sendPrivateMessage(
                request.getSenderId(),
                request.getRecipientId(),
                request.getContent()
        );
        return ResponseEntity.ok(messageService.convertToDTO(message, request.getRecipientId()));
    }

    @PostMapping("/group")
    public ResponseEntity<MessageDTO> sendGroupMessage(
            @RequestBody GroupMessageRequest request) {
        Message message = messageService.sendGroupMessage(
                request.getSenderId(),
                request.getConversationId(),
                request.getContent()
        );
        return ResponseEntity.ok(messageService.convertToDTO(message, request.getSenderId()));
    }

    @GetMapping("/private")
    public ResponseEntity<List<MessageDTO>> getPrivateConversation(
            @RequestParam Long user1Id,
            @RequestParam Long user2Id) {
        List<Message> messages = messageService.getPrivateConversation(user1Id, user2Id);
        return ResponseEntity.ok(messages.stream()
                .map(message -> messageService.convertToDTO(message, user1Id))
                .collect(Collectors.toList()));
    }

    @GetMapping("/group/{conversationId}")
    public ResponseEntity<List<MessageDTO>> getGroupConversation(
            @PathVariable Long conversationId,
            @RequestParam Long userId) {
        List<Message> messages = messageService.getGroupConversation(conversationId);
        return ResponseEntity.ok(messages.stream()
                .map(message -> messageService.convertToDTO(message, userId))
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
                .map(message -> messageService.convertToDTO(message, userId))
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
        return ResponseEntity.ok(messageService.convertToDTO(updatedMessage, request.getUserId()));
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<MessageDTO> deleteMessage(
            @PathVariable Long messageId,
            @RequestParam Long userId) {
        Message updatedMessage = messageService.deleteMessage(messageId, userId);
        return ResponseEntity.ok(messageService.convertToDTO(updatedMessage, userId));
    }

    @GetMapping("/{messageId}")
    public ResponseEntity<MessageDTO> getMessageById(
            @PathVariable Long messageId,
            @RequestParam Long userId) {
        Message message = messageService.getMessageById(messageId)
                .orElseThrow(() -> new RuntimeException("Message non trouvé"));
        return ResponseEntity.ok(messageService.convertToDTO(message, userId));
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<MessageDTO>> getConversationMessages(
            @PathVariable Long conversationId,
            @RequestParam Long userId,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateEnvoi").descending());
        List<Message> messages = messageService.getAllMessagesByConversationId(conversationId, pageable);
        System.out.println("Fetched " + messages.size() + " messages for conversation " + conversationId + ": " + messages);
        return ResponseEntity.ok(messages.stream()
                .map(message -> messageService.convertToDTO(message, userId))
                .collect(Collectors.toList()));
    }

    @GetMapping("/unread/count/{conversationId}")
    public ResponseEntity<Long> getUnreadMessageCount(
            @PathVariable Long conversationId,
            @RequestParam Long userId) {
        Long count = messageService.getUnreadMessageCount(conversationId, userId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/unread/total-count/{userId}")
    public ResponseEntity<Long> getTotalUnreadMessageCount(
            @PathVariable Long userId) {
        Long count = messageService.getTotalUnreadMessageCount(userId);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/{messageId}/reactions")
    public ResponseEntity<MessageDTO> addReaction(
            @PathVariable Long messageId,
            @RequestParam Long userId,
            @RequestParam String emoji) {
        MessageDTO updatedMessage = messageService.addReaction(messageId, userId, emoji);
        return ResponseEntity.ok(updatedMessage);
    }

    @DeleteMapping("/{messageId}/reactions")
    public ResponseEntity<MessageDTO> removeReaction(
            @PathVariable Long messageId,
            @RequestParam Long userId) {
        MessageDTO updatedMessage = messageService.removeReaction(messageId, userId);
        return ResponseEntity.ok(updatedMessage);
    }

    private MessageDTO convertToDTO(Message message, Long viewerId) {
        User sender = userService.findById(message.getSenderId());


        MessageDTO.MessageDTOBuilder builder = MessageDTO.builder()
                .id(message.getId())
                .content(message.getContent())
                .timestamp(message.getDateEnvoi())
                .isRead(false) // Will be set by MessageService.convertToDTO
                .senderId(message.getSenderId())
                .senderName(sender.getUsername())
                .senderAvatar(sender.getProfilePictureUrl())
                .conversationId(message.getConversation().getId())
                .dateEnvoi(message.getDateEnvoi())
                .reactionMessages(message.getReactionMessages().stream()
                        .map(r -> {
                            User reactionUser = userService.findById(r.getUserId());
                            return ReactionMessageDTO.builder()
                                    .id(r.getId())
                                    .userId(r.getUserId())
                                    .username(reactionUser.getUsername())
                                    .emoji(r.getEmoji())
                                    .build();
                        })
                        .collect(Collectors.toList()));

        if (message.getConversation().isEstGroupe()) {
            builder.groupId(message.getConversation().getId());
        }

        return messageService.convertToDTO(message, viewerId); // Delegate to MessageService
    }

    @lombok.Data
    public static class PrivateMessageRequest {
        private Long senderId;
        private Long recipientId;
        private String content;
    }

    @lombok.Data
    public static class GroupMessageRequest {
        private Long senderId;
        private Long conversationId;
        private String content;
    }

    @lombok.Data
    public static class UpdateMessageRequest {
        private Long userId;
        private String newContent;
    }
}