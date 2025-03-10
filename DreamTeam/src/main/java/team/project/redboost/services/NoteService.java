package team.project.redboost.services;

import team.project.redboost.entities.Note;
import java.util.List;
import java.util.Optional;

public interface NoteService {
    // Create
    Note createNote(Note note);

    // Read
    List<Note> getAllNotes();

    Optional<Note> getNoteById(Long id);

    // Update
    Note updateNote(Long id, Note note);

    // Delete
    void deleteNote(Long id);
}