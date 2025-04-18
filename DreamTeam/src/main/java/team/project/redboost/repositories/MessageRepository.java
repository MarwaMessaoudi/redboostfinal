package team.project.redboost.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import team.project.redboost.entities.Message;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // Messages privés entre deux utilisateurs (incluant les messages supprimés)
    @Query("SELECT m FROM Message m LEFT JOIN FETCH m.reactionMessages WHERE " +
            "(m.sender.id = :user1Id AND m.recipient.id = :user2Id) OR " +
            "(m.sender.id = :user2Id AND m.recipient.id = :user1Id) " +
            "ORDER BY m.dateEnvoi ASC")
    List<Message> findPrivateMessages(@Param("user1Id") Long user1Id,
                                      @Param("user2Id") Long user2Id);

    // Messages privés entre deux utilisateurs (excluant les messages supprimés)
    @Query("SELECT m FROM Message m LEFT JOIN FETCH m.reactionMessages WHERE " +
            "((m.sender.id = :user1Id AND m.recipient.id = :user2Id) OR " +
            "(m.sender.id = :user2Id AND m.recipient.id = :user1Id)) " +
            "AND m.deleted = false " +
            "ORDER BY m.dateEnvoi ASC")
    List<Message> findNonDeletedPrivateMessages(@Param("user1Id") Long user1Id,
                                                @Param("user2Id") Long user2Id);

    // Messages d'une conversation de groupe (incluant les messages supprimés)
    @Query("SELECT m FROM Message m LEFT JOIN FETCH m.reactionMessages WHERE " +
            "m.conversation.id = :conversationId " +
            "ORDER BY m.dateEnvoi ASC")
    List<Message> findByConversationId(@Param("conversationId") Long conversationId);

    // Messages d'une conversation de groupe (excluant les messages supprimés)
    @Query("SELECT m FROM Message m LEFT JOIN FETCH m.reactionMessages WHERE " +
            "m.conversation.id = :conversationId " +
            "AND m.deleted = false " +
            "ORDER BY m.dateEnvoi ASC")
    List<Message> findNonDeletedByConversationId(@Param("conversationId") Long conversationId);

    // Paginated messages for a conversation (excluant les messages supprimés)
    @Query("SELECT m FROM Message m LEFT JOIN FETCH m.reactionMessages WHERE " +
            "m.conversation.id = :conversationId " +
            "AND m.deleted = false")
    List<Message> findNonDeletedByConversationId(@Param("conversationId") Long conversationId,
                                                 Pageable pageable);

    // Messages for a conversation with custom sorting (excluant les messages supprimés)
    @Query("SELECT m FROM Message m LEFT JOIN FETCH m.reactionMessages WHERE " +
            "m.conversation.id = :conversationId AND m.deleted = false")
    List<Message> findNonDeletedByConversationId(@Param("conversationId") Long conversationId,
                                                 Sort sort);

    // Messages non lus pour un utilisateur (incluant les messages supprimés)
    @Query("SELECT m FROM Message m LEFT JOIN FETCH m.reactionMessages WHERE " +
            "m.recipient.id = :userId AND m.estLu = false")
    List<Message> findUnreadMessages(@Param("userId") Long userId);

    // Messages non lus pour un utilisateur (excluant les messages supprimés)
    @Query("SELECT m FROM Message m LEFT JOIN FETCH m.reactionMessages WHERE " +
            "m.recipient.id = :userId " +
            "AND m.estLu = false " +
            "AND m.deleted = false")
    List<Message> findUnreadNonDeletedMessages(@Param("userId") Long userId);

    // Marquer des messages comme lus
    @Modifying
    @Query("UPDATE Message m SET m.estLu = true WHERE m.id IN :messageIds " +
            "AND m.recipient.id = :userId")
    void markMessagesAsRead(@Param("messageIds") List<Long> messageIds,
                            @Param("userId") Long userId);

    // Soft delete d'un message
    @Modifying
    @Query("UPDATE Message m SET m.deleted = true WHERE m.id = :messageId " +
            "AND m.sender.id = :userId")
    void softDeleteMessage(@Param("messageId") Long messageId,
                           @Param("userId") Long userId);

    // Tous les messages non supprimés
    @Query("SELECT m FROM Message m LEFT JOIN FETCH m.reactionMessages WHERE m.deleted = false")
    List<Message> findAllNonDeleted();

    // Tous les messages non supprimés avec pagination
    @Query("SELECT m FROM Message m LEFT JOIN FETCH m.reactionMessages WHERE m.deleted = false")
    List<Message> findAllNonDeleted(Pageable pageable);

    // Message par ID avec reactions
    @Query("SELECT m FROM Message m LEFT JOIN FETCH m.reactionMessages WHERE m.id = :messageId")
    Optional<Message> findByIdWithReactionMessages(@Param("messageId") Long messageId);
}