package team.project.redboost.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder // Add this annotation at the class level
public class MessageDTO {
    private Long id;
    private String content;
    private LocalDateTime timestamp;
    private boolean isRead;
    private String senderAvatar; // Add this field
    // Pour les messages privÃ©s
    private Long senderId;
    private String senderName;
    private Long recipientId;

    // Pour les messages de groupe
    private Long groupId;
    private String groupName;

    private Long conversationId;

    private List<ReactionMessageDTO> reactionMessages;

    @Builder.Default
    private LocalDateTime dateEnvoi = LocalDateTime.now();

    public String getSenderAvatar() {
        return senderAvatar;
    }

    public void setSenderAvatar(String senderAvatar) {
        this.senderAvatar = senderAvatar;
    }

}