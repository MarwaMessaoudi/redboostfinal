package team.project.redboost.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.project.redboost.entities.*;
import team.project.redboost.repositories.*;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;

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

        return messageRepository.save(message);
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

        return messageRepository.save(message);
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
        return messageRepository.save(message);
    }

    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getSender().getId().equals(userId)) {
            throw new RuntimeException("User not authorized to delete this message");
        }

        message.setDeleted(true);
        messageRepository.save(message);
    }

    public Optional<Message> getMessageById(Long messageId) {
        return messageRepository.findById(messageId)
                .filter(message -> !message.isDeleted());
    }

    /**
     * Get all non-deleted messages for a conversation (ordered by date ascending)
     * @param conversationId The ID of the conversation
     * @return List of messages
     */
    public List<Message> getAllMessagesByConversationId(Long conversationId) {
        return messageRepository.findNonDeletedByConversationId(conversationId, Sort.by("dateEnvoi").ascending());
    }

    /**
     * Get paginated messages for a conversation
     * @param conversationId The ID of the conversation
     * @param pageable Pagination and sorting information
     * @return List of messages for the requested page
     */
    public List<Message> getAllMessagesByConversationId(Long conversationId, Pageable pageable) {
        return messageRepository.findNonDeletedByConversationId(conversationId, pageable);
    }

    /**
     * Get all messages with custom sorting
     * @param conversationId The ID of the conversation
     * @param sort Sorting criteria
     * @return List of messages sorted as requested
     */
    public List<Message> getAllMessagesByConversationId(Long conversationId, Sort sort) {
        return messageRepository.findNonDeletedByConversationId(conversationId, sort);
    }

    // Deprecated methods - kept for backward compatibility
    @Deprecated
    public List<Message> getAllMessages() {
        return messageRepository.findAllNonDeleted();
    }

    @Deprecated
    public List<Message> getAllMessages(Pageable pageable) {
        return messageRepository.findAllNonDeleted(pageable);
    }
}