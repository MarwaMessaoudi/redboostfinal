package team.project.redboost.services;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.project.redboost.entities.Conversation;
import team.project.redboost.entities.User;
import team.project.redboost.repositories.ConversationRepository;
import team.project.redboost.repositories.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    // Créer une conversation privée
    @Transactional
    public Conversation createPrivateConversation(Long user1Id, Long user2Id) {
        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new RuntimeException("Utilisateur 1 non trouvé"));
        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new RuntimeException("Utilisateur 2 non trouvé"));

        // Vérifier si une conversation existe déjà
        return conversationRepository.findPrivateConversation(user1, user2)
                .orElseGet(() -> {
                    Conversation conv = new Conversation();
                    conv.setEstGroupe(false);
                    conv.setTitre(generatePrivateConversationName(user1, user2));
                    conv.getParticipants().add(user1);
                    conv.getParticipants().add(user2);
                    return conversationRepository.save(conv);
                });
    }

    // Créer un groupe
    @Transactional
    public Conversation createGroupConversation(String groupName, Long creatorId, List<Long> memberIds) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Créateur non trouvé"));

        Conversation conv = new Conversation();
        conv.setEstGroupe(true);
        conv.setTitre(groupName);
        conv.setCreator(creator);
        conv.getParticipants().add(creator);

        // Ajouter les membres
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

        // Vérifie les droits (exemple pour les groupes)
        if (conversation.isEstGroupe() && !conversation.getCreator().getId().equals(userId)) {
            throw new SecurityException("Seul le créateur peut supprimer le groupe");
        }

        // Vérification pour les conversations privées
        if (!conversation.isEstGroupe() && !conversation.getParticipants().stream()
                .anyMatch(u -> u.getId().equals(userId))) {
            throw new SecurityException("Vous n'êtes pas participant");
        }

        conversationRepository.delete(conversation);
    }


    // Ajouter un membre à une conversation de groupe
    @Transactional
    public Conversation addMemberToConversation(Long conversationId, Long currentUserId, Long memberId) {
        // Trouver la conversation
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation non trouvée"));

        // Vérifier que c'est une conversation de groupe
        if (!conversation.isEstGroupe()) {
            throw new IllegalArgumentException("Impossible d'ajouter des membres à une conversation privée");
        }

        // Vérifier que l'utilisateur actuel est un participant
        boolean isParticipant = conversation.getParticipants().stream()
                .anyMatch(user -> user.getId().equals(currentUserId));
        if (!isParticipant) {
            throw new SecurityException("L'utilisateur n'est pas autorisé à modifier cette conversation");
        }

        // Trouver le nouveau membre
        User newMember = userRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur non trouvé"));

        // Vérifier si le membre est déjà dans la conversation
        if (conversation.getParticipants().contains(newMember)) {
            throw new IllegalArgumentException("L'utilisateur est déjà membre de cette conversation");
        }

        // Ajouter le nouveau membre
        conversation.getParticipants().add(newMember);
        return conversationRepository.save(conversation);
    }

}