package team.project.redboost.services;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.project.redboost.dto.MessageDTO;
import team.project.redboost.dto.NotificationDTO;
import team.project.redboost.dto.ReactionMessageDTO;
import team.project.redboost.entities.*;
import team.project.redboost.repositories.*;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final ReactionMessageRepository reactionMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private static final List<String> VALID_EMOJIS = List.of("👍", "❤️", "😂", "😮", "😢", "😡");

    @Transactional
    public Message sendPrivateMessage(Long senderId, Long recipientId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        Conversation conversation = conversationRepository.findPrivateConversation(senderId, recipientId)
                .orElseGet(() -> {
                    Conversation newConversation = new Conversation();
                    newConversation.setEstGroupe(false);
                    newConversation.getParticipants().add(sender);
                    newConversation.getParticipants().add(recipient);
                    return conversationRepository.save(newConversation);
                });

        Message message = new Message();
        message.setContent(content);
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setConversation(conversation);
        message.setEstLu(false);
        message.setDeleted(false);
        message.setDateEnvoi(LocalDateTime.now());

        Message savedMessage = messageRepository.save(message);
        MessageDTO messageDTO = convertToDTO(savedMessage);
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversation.getId(),
                messageDTO
        );

        // Send notification to recipient
        NotificationDTO notification = NotificationDTO.builder()
                .messageId(savedMessage.getId())
                .conversationId(conversation.getId())
                .senderId(sender.getId())
                .senderName(sender.getUsername())
                .contentPreview(content.length() > 50 ? content.substring(0, 47) + "..." : content)
                .timestamp(savedMessage.getDateEnvoi().toString())
                .build();
        messagingTemplate.convertAndSend(
                "/topic/notifications/" + recipientId,
                notification
        );

        return savedMessage;
    }

    @Transactional
    public Message sendGroupMessage(Long senderId, Long conversationId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Expéditeur non trouvé avec l'ID: " + senderId));

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation non trouvée avec l'ID: " + conversationId));

        if (conversation.isDeleted()) {
            throw new RuntimeException("Impossible d'envoyer un message: la conversation a été supprimée");
        }

        if (!conversation.isEstGroupe()) {
            throw new RuntimeException("L'ID fourni ne correspond pas à une conversation de groupe");
        }

        boolean isMember = conversation.getParticipants().stream()
                .anyMatch(user -> user.getId().equals(senderId));

        if (!isMember) {
            throw new RuntimeException("L'utilisateur " + senderId + " n'est pas membre de cette conversation");
        }

        Message message = new Message();
        message.setContent(content);
        message.setSender(sender);
        message.setRecipient(null);
        message.setConversation(conversation);
        message.setEstLu(false);
        message.setDeleted(false);
        message.setDateEnvoi(LocalDateTime.now());

        Message savedMessage = messageRepository.save(message);
        MessageDTO messageDTO = convertToDTO(savedMessage);
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversationId,
                messageDTO
        );

        // Send notification to all group members except the sender
        conversation.getParticipants().stream()
                .filter(user -> !user.getId().equals(senderId))
                .forEach(user -> {
                    NotificationDTO notification = NotificationDTO.builder()
                            .messageId(savedMessage.getId())
                            .conversationId(conversationId)
                            .senderId(sender.getId())
                            .senderName(sender.getUsername())
                            .contentPreview(content.length() > 50 ? content.substring(0, 47) + "..." : content)
                            .timestamp(savedMessage.getDateEnvoi().toString())
                            .build();
                    messagingTemplate.convertAndSend(
                            "/topic/notifications/" + user.getId(),
                            notification
                    );
                });

        return savedMessage;
    }

    @Transactional
    public MessageDTO addReaction(Long messageId, Long userId, String emoji) {
        Message message = messageRepository.findByIdWithReactionMessages(messageId)
                .orElseThrow(() -> new RuntimeException("Message non trouvé"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (message.isDeleted()) {
            throw new RuntimeException("Impossible d'ajouter une réaction à un message supprimé");
        }

        if (emoji == null || emoji.trim().isEmpty()) {
            throw new IllegalArgumentException("L'emoji ne peut pas être vide");
        }
        if (!VALID_EMOJIS.contains(emoji)) {
            throw new IllegalArgumentException("Emoji non valide");
        }

        Optional<ReactionMessage> existingReaction = reactionMessageRepository.findByMessageIdAndUserId(messageId, userId);
        if (existingReaction.isPresent()) {
            ReactionMessage reaction = existingReaction.get();
            reaction.setEmoji(emoji);
            reactionMessageRepository.save(reaction);
        } else {
            ReactionMessage reaction = new ReactionMessage();
            reaction.setMessage(message);
            reaction.setUser(user);
            reaction.setEmoji(emoji);
            reactionMessageRepository.save(reaction);
        }

        MessageDTO updatedMessage = convertToDTO(message);
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + message.getConversation().getId(),
                updatedMessage
        );
        return updatedMessage;
    }

    @Transactional
    public MessageDTO removeReaction(Long messageId, Long userId) {
        Message message = messageRepository.findByIdWithReactionMessages(messageId)
                .orElseThrow(() -> new RuntimeException("Message non trouvé"));

        if (message.isDeleted()) {
            throw new RuntimeException("Impossible de supprimer une réaction d'un message supprimé");
        }

        reactionMessageRepository.deleteByMessageIdAndUserId(messageId, userId);
        MessageDTO updatedMessage = convertToDTO(message);
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + message.getConversation().getId(),
                updatedMessage
        );
        return updatedMessage;
    }

    public List<Message> getPrivateConversation(Long user1Id, Long user2Id) {
        return messageRepository.findNonDeletedPrivateMessages(user1Id, user2Id);
    }

    public List<Message> getGroupConversation(Long conversationId) {
        return getAllMessagesByConversationId(conversationId);
    }

    @Transactional
    public void markMessagesAsRead(List<Long> messageIds, Long userId) {
        messageRepository.markMessagesAsRead(messageIds, userId);
        messageIds.forEach(messageId -> {
            messageRepository.findById(messageId).ifPresent(message -> {
                MessageDTO updatedMessage = convertToDTO(message);
                messagingTemplate.convertAndSend(
                        "/topic/conversation/" + message.getConversation().getId(),
                        updatedMessage
                );
            });
        });
    }

    public List<Message> getUnreadMessages(Long userId) {
        return messageRepository.findUnreadNonDeletedMessages(userId);
    }

    @Transactional
    public Message updateMessage(Long messageId, Long userId, String newContent) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (message.isDeleted()) {
            throw new RuntimeException("Cannot update deleted message");
        }

        if (!message.getSender().getId().equals(userId)) {
            throw new RuntimeException("User not authorized to update this message");
        }

        message.setContent(newContent);
        Message updatedMessage = messageRepository.save(message);
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + message.getConversation().getId(),
                convertToDTO(updatedMessage)
        );
        return updatedMessage;
    }

    @Transactional
    public Message deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (userId != null && !message.getSender().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this message");
        }

        message.setContent("Message retiré");
        Message updatedMessage = messageRepository.save(message);
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + message.getConversation().getId(),
                convertToDTO(updatedMessage)
        );
        return updatedMessage;
    }

    public Optional<Message> getMessageById(Long messageId) {
        return messageRepository.findById(messageId)
                .filter(message -> !message.isDeleted());
    }

    public List<Message> getAllMessagesByConversationId(Long conversationId) {
        return messageRepository.findNonDeletedByConversationId(conversationId, Sort.by("dateEnvoi").ascending());
    }

    public List<Message> getAllMessagesByConversationId(Long conversationId, Pageable pageable) {
        return messageRepository.findNonDeletedByConversationId(conversationId, pageable);
    }

    public List<Message> getAllMessagesByConversationId(Long conversationId, Sort sort) {
        return messageRepository.findNonDeletedByConversationId(conversationId, sort);
    }

    @Deprecated
    public List<Message> getAllMessages() {
        return messageRepository.findAllNonDeleted();
    }

    @Deprecated
    public List<Message> getAllMessages(Pageable pageable) {
        return messageRepository.findAllNonDeleted(pageable);
    }

    public Long getUnreadMessageCount(Long conversationId, Long userId) {
        return messageRepository.countUnreadMessagesByConversationIdAndUserId(conversationId, userId);
    }

    public Long getTotalUnreadMessageCount(Long userId) {
        return messageRepository.countAllUnreadMessagesByUserId(userId);
    }


    private MessageDTO convertToDTO(Message message) {
        MessageDTO.MessageDTOBuilder builder = MessageDTO.builder()
                .id(message.getId())
                .content(message.getContent())
                .timestamp(message.getDateEnvoi())
                .isRead(message.isEstLu())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getUsername())
                .senderAvatar(message.getSender().getProfilePictureUrl())
                .conversationId(message.getConversation().getId())
                .dateEnvoi(message.getDateEnvoi())
                .reactionMessages(message.getReactionMessages().stream()
                        .map(r -> ReactionMessageDTO.builder()
                                .id(r.getId())
                                .userId(r.getUser().getId())
                                .username(r.getUser().getUsername())
                                .emoji(r.getEmoji())
                                .build())
                        .collect(Collectors.toList()));

        if (message.getRecipient() != null) {
            builder.recipientId(message.getRecipient().getId());
        }

        if (message.getConversation().isEstGroupe()) {
            builder.groupId(message.getConversation().getId());
        }

        return builder.build();
    }




}