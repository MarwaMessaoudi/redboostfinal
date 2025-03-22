package team.project.redboost.repositories;

import team.project.redboost.entities.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    // Trouver une note par son titre
    Optional<Note> findByTitle(String title);

    // Trouver une note par l'ID de la réunion associée
    Optional<Note> findByMeetingId(Long meetingId);

    // Trouver toutes les notes contenant un certain texte dans leur contenu
    List<Note> findByContentContaining(String content);

    // Vérifier si une réunion a déjà une note
    boolean existsByMeetingId(Long meetingId);
}