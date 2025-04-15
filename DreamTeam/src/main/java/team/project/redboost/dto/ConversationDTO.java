package team.project.redboost.dto;

import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class ConversationDTO {
    private Long id;
    private String titre;
    private boolean estGroupe;
    private Long creatorId;
    private Set<Long> participantIds;
    // Vous pourriez ajouter d'autres champs si nécessaire,
    // comme le dernier message ou le nombre de messages non lus


    @Data
    public static class CreatePrivateConversationRequest {
        private Long recipientId;
    }

    @Data
    public static class CreateGroupRequest {
        private String name;
        private List<Long> memberIds;
    }
}