/*package team.project.redboost.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import team.project.redboost.dto.MessageDTO;
import team.project.redboost.entities.Message;
import team.project.redboost.services.MessageService;

import java.security.Principal;
import java.time.Instant;
import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;

    @MessageMapping("/chat.private")
    public void handlePrivateMessage(@Payload MessageDTO messageDTO,
                                     Principal principal,
                                     SimpMessageHeaderAccessor headerAccessor) {
        try {
            validateMessageDTO(messageDTO);

            Message message = messageService.sendPrivateMessage(
                    Long.parseLong(principal.getName()),
                    messageDTO.getRecipientId(),
                    messageDTO.getContent()
            );

            MessageDTO responseDTO = buildResponseDTO(message);
            sendPrivateResponse(responseDTO, principal, headerAccessor);

        } catch (Exception e) {
            log.error("Private message handling failed", e);
            sendError(principal.getName(), "Failed to send private message");
        }
    }

    @MessageMapping("/chat.group")
    public void handleGroupMessage(@Payload MessageDTO messageDTO,
                                   Principal principal,
                                   SimpMessageHeaderAccessor headerAccessor) {
        try {
            validateGroupMessageDTO(messageDTO);

            Message message = messageService.sendGroupMessage(
                    Long.parseLong(principal.getName()),
                    messageDTO.getGroupId(),
                    messageDTO.getContent()
            );

            MessageDTO responseDTO = buildGroupResponseDTO(message);
            messagingTemplate.convertAndSend(
                    "/topic/group." + messageDTO.getGroupId(),
                    responseDTO,
                    createHeaders(headerAccessor.getSessionId())
            );

        } catch (Exception e) {
            log.error("Group message handling failed", e);
            sendError(principal.getName(), "Failed to send group message");
        }
    }

    // Helper methods
    private void validateMessageDTO(MessageDTO dto) {
        if (dto.getRecipientId() == null || dto.getContent() == null || dto.getContent().isBlank()) {
            throw new IllegalArgumentException("Invalid message data");
        }
    }

    private void validateGroupMessageDTO(MessageDTO dto) {
        if (dto.getGroupId() == null || dto.getContent() == null || dto.getContent().isBlank()) {
            throw new IllegalArgumentException("Invalid group message data");
        }
    }

    private MessageDTO buildResponseDTO(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .content(message.getContent())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFirstName())
                .recipientId(message.getRecipient().getId())
                .dateEnvoi(message.getDateEnvoi())
                .conversationId(message.getConversation().getId())
                .build();
    }

    private MessageDTO buildGroupResponseDTO(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .content(message.getContent())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFirstName())
                .groupId(message.getConversation().getId())
                .dateEnvoi(message.getDateEnvoi())
                .build();
    }

    private void sendPrivateResponse(MessageDTO responseDTO,
                                     Principal principal,
                                     SimpMessageHeaderAccessor headerAccessor) {
        // To recipient
        messagingTemplate.convertAndSendToUser(
                responseDTO.getRecipientId().toString(),
                "/queue/private",
                responseDTO,
                createHeaders(headerAccessor.getSessionId())
        );

        // Copy to sender
        messagingTemplate.convertAndSendToUser(
                principal.getName(),
                "/queue/private",
                responseDTO,
                createHeaders(headerAccessor.getSessionId())
        );
    }

    private void sendError(String username, String error) {
        messagingTemplate.convertAndSendToUser(
                username,
                "/queue/errors",
                Map.of(
                        "timestamp", Instant.now(),
                        "error", error
                )
        );
    }

    private Map<String, Object> createHeaders(String sessionId) {
        return Map.of(
                "simpSessionId", sessionId,
                "timestamp", System.currentTimeMillis()
        );
    }
}*/