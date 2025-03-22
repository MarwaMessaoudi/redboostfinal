package team.project.redboost.dtos;

import lombok.Data;

@Data
public class CreateFolderRequest {
    private String folderName;
    private Long categoryId;
    private Long parentFolderId; //This is new!
    private String folderPath; //Optional. You can generate it in backend.
}

