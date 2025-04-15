package team.project.redboost.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import team.project.redboost.entities.Conversation;
import team.project.redboost.entities.User;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    // Trouver une conversation privée entre 2 utilisateurs (version avec User objects)
    @Query("SELECT c FROM Conversation c WHERE " +
            "c.estGroupe = false AND " +
            ":user1 MEMBER OF c.participants AND " +
            ":user2 MEMBER OF c.participants AND " +
            "SIZE(c.participants) = 2")
    Optional<Conversation> findPrivateConversation(@Param("user1") User user1,
                                                   @Param("user2") User user2);

    // Trouver toutes les conversations d'un utilisateur (groupes + privées)
    @Query("SELECT c FROM Conversation c WHERE :user MEMBER OF c.participants " +
            "ORDER BY (SELECT MAX(m.dateEnvoi) FROM c.messages m) DESC")
    List<Conversation> findAllUserConversations(@Param("user") User user);

    // Trouver les conversations de groupe d'un utilisateur
    @Query("SELECT c FROM Conversation c WHERE " +
            "c.estGroupe = true AND :user MEMBER OF c.participants")
    List<Conversation> findUserGroupConversations(@Param("user") User user);

    // Vérifier si un utilisateur appartient à une conversation
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
            "FROM Conversation c WHERE c.id = :conversationId AND :user MEMBER OF c.participants")
    boolean isUserInConversation(@Param("user") User user,
                                 @Param("conversationId") Long conversationId);

    // Trouver les conversations avec des messages non lus
    @Query("SELECT DISTINCT c FROM Conversation c " +
            "JOIN c.messages m " +
            "WHERE :user MEMBER OF c.participants AND " +
            "m.estLu = false AND " +
            "m.recipient = :user")
    List<Conversation> findConversationsWithUnreadMessages(@Param("user") User user);

    @Query("SELECT c FROM Conversation c WHERE :user MEMBER OF c.participants AND c.isDeleted = false")
    List<Conversation> findAllActiveUserConversations(@Param("user") User user);

    // Version avec user IDs - corrigée pour utiliser estGroupe
    @Query("SELECT c FROM Conversation c " +
            "JOIN c.participants p1 " +
            "JOIN c.participants p2 " +
            "WHERE c.estGroupe = false " +  // Changé de isGroupConversation à estGroupe
            "AND p1.id = :user1Id AND p2.id = :user2Id")
    Optional<Conversation> findPrivateConversation(@Param("user1Id") Long user1Id,
                                                   @Param("user2Id") Long user2Id);
}