package team.project.redboost.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.project.redboost.entities.Conversation;
import team.project.redboost.entities.User;
import team.project.redboost.repositories.ConversationRepository;
import team.project.redboost.repositories.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    @Transactional
    public Conversation createPrivateConversation(Long user1Id, Long user2Id) {
        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new RuntimeException("Utilisateur 1 non trouvé"));
        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new RuntimeException("Utilisateur 2 non trouvé"));

        return conversationRepository.findPrivateConversation(user1.getId(), user2.getId())
                .orElseGet(() -> {
                    Conversation conv = new Conversation();
                    conv.setEstGroupe(false);
                    conv.setTitre(generatePrivateConversationName(user1, user2));
                    conv.setCreator(user1);
                    conv.getParticipants().add(user1);
                    conv.getParticipants().add(user2);
                    return conversationRepository.save(conv);
                });
    }

    @Transactional
    public Conversation createGroupConversation(String groupName, Long creatorId, List<Long> memberIds) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Créateur non trouvé"));

        Conversation conv = new Conversation();
        conv.setEstGroupe(true);
        conv.setTitre(groupName);
        conv.setCreator(creator);
        conv.getParticipants().add(creator);

        memberIds.forEach(memberId -> {
            User member = userRepository.findById(memberId)
                    .orElseThrow(() -> new RuntimeException("Membre non trouvé: " + memberId));
            conv.getParticipants().add(member);
        });

        return conversationRepository.save(conv);
    }

    private String generatePrivateConversationName(User user1, User user2) {
        return String.format("%s & %s", user1.getFirstName(), user2.getFirstName());
    }

    @Transactional
    public void deleteConversation(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation non trouvée"));

        if (conversation.isEstGroupe() && !conversation.getCreator().getId().equals(userId)) {
            throw new SecurityException("Seul le créateur peut supprimer le groupe");
        }

        if (!conversation.isEstGroupe() && !conversation.getParticipants().stream()
                .anyMatch(u -> u.getId().equals(userId))) {
            throw new SecurityException("Vous n'êtes pas participant");
        }

        conversationRepository.delete(conversation);
    }

    @Transactional
    public Conversation addMemberToConversation(Long conversationId, Long currentUserId, Long memberId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation non trouvée"));

        if (!conversation.isEstGroupe()) {
            throw new IllegalArgumentException("Impossible d'ajouter des membres à une conversation privée");
        }

        boolean isParticipant = conversation.getParticipants().stream()
                .anyMatch(user -> user.getId().equals(currentUserId));
        if (!isParticipant) {
            throw new SecurityException("L'utilisateur n'est pas autorisé à modifier cette conversation");
        }

        User newMember = userRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé"));

        if (conversation.getParticipants().contains(newMember)) {
            throw new IllegalArgumentException("L'utilisateur est déjà membre de cette conversation");
        }

        conversation.getParticipants().add(newMember);
        return conversationRepository.save(conversation);
    }

    @Transactional(readOnly = true)
    public List<User> getGroupMembers(Long conversationId, Long currentUserId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation non trouvée"));

        if (!conversation.isEstGroupe()) {
            throw new IllegalArgumentException("Cette fonctionnalité est uniquement pour les conversations de groupe");
        }

        boolean isParticipant = conversation.getParticipants().stream()
                .anyMatch(user -> user.getId().equals(currentUserId));
        if (!isParticipant) {
            throw new SecurityException("L'utilisateur n'est pas autorisé à voir les membres de cette conversation");
        }

        return new ArrayList<>(conversation.getParticipants());
    }

    @Transactional(readOnly = true)
    public List<User> getNonMembers(Long conversationId, Long currentUserId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found"));

        List<User> allUsers = userRepository.findAll();
        Set<Long> participantIds = conversation.getParticipants().stream()
                .map(User::getId)
                .collect(Collectors.toSet());

        return allUsers.stream()
                .filter(user -> !participantIds.contains(user.getId()))
                .filter(user -> !user.getId().equals(currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional
    public void leaveGroupConversation(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found"));

        if (!conversation.isEstGroupe()) {
            throw new IllegalArgumentException("Cannot leave a non-group conversation");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (conversation.getCreator().getId().equals(userId)) {
            throw new IllegalArgumentException("Group creator cannot leave the group");
        }

        boolean removed = conversation.getParticipants().removeIf(participant -> participant.getId().equals(userId));
        if (!removed) {
            throw new IllegalArgumentException("User is not a member of this group");
        }

        conversationRepository.save(conversation);
    }
}