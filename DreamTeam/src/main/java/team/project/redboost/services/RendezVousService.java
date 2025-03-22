package team.project.redboost.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import team.project.redboost.entities.Entrepreneur;
import team.project.redboost.entities.RendezVous;
import team.project.redboost.entities.Coach;
import team.project.redboost.repositories.CoachRepository;
import team.project.redboost.repositories.EntrepreneurRepository;

import team.project.redboost.repositories.RendezVousRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class RendezVousService {

    @Autowired
    private RendezVousRepository rendezVousRepository;

    @Autowired
    private CoachRepository coachRepository;
    @Autowired
    private EntrepreneurRepository entrepreneurRepository;

    public Optional<RendezVous> getRendezVousById(Long id) {
        return rendezVousRepository.findById(id);
    }
    // Créer un rendez-vous avec statut "PENDING" par défaut
    public RendezVous createRendezVous(RendezVous rendezVous) {
        if (rendezVous.getStatus() == null) {
            rendezVous.setStatus(RendezVous.Status.PENDING); // Assurer que le statut est "PENDING" par défaut
        }
        return rendezVousRepository.save(rendezVous);
    }
    public List<RendezVous> getRendezVousByEntrepreneurId(Long entrepreneurId) {
        if (entrepreneurId == null) {
            throw new IllegalArgumentException("L'ID de l'entrepreneur ne peut pas être null");
        }
        List<RendezVous> rendezVous = rendezVousRepository.findByEntrepreneurId(entrepreneurId);
        if (rendezVous.isEmpty()) {
            throw new RuntimeException("Aucun rendez-vous trouvé pour cet entrepreneur");
        }
        return rendezVous;
    }




    public List<RendezVous> getRendezVousByCoachId(Long CoachId) {
        if (CoachId == null) {
            throw new IllegalArgumentException("L'ID de l'entrepreneur ne peut pas être null");
        }
        List<RendezVous> rendezVous = rendezVousRepository.findByCoachId(CoachId);
        if (rendezVous.isEmpty()) {
            throw new RuntimeException("Aucun rendez-vous trouvé pour cet entrepreneur");
        }
        return rendezVous;
    }




    // Récupérer tous les rendez-vous
    public List<RendezVous> getAllRendezVous() {
        return rendezVousRepository.findAll();
    }



    public RendezVous updateRendezVous(Long id, RendezVous newRendezVous) {
        return rendezVousRepository.findById(id)
                .map(existingRdv -> {
                    // Mettre à jour les champs simples
                    if (newRendezVous.getTitle() != null) {
                        existingRdv.setTitle(newRendezVous.getTitle());
                    }
                    if (newRendezVous.getEmail() != null) {
                        existingRdv.setEmail(newRendezVous.getEmail());
                    }
                    if (newRendezVous.getDate() != null) {
                        existingRdv.setDate(newRendezVous.getDate());
                    }
                    if (newRendezVous.getHeure() != null) {
                        existingRdv.setHeure(newRendezVous.getHeure());
                    }
                    if (newRendezVous.getDescription() != null) {
                        existingRdv.setDescription(newRendezVous.getDescription());
                    }
                    if (newRendezVous.getStatus() != null) {
                        existingRdv.setStatus(newRendezVous.getStatus());
                    }

                    // Charger et mettre à jour le coach si fourni
                    if (newRendezVous.getCoach() != null && newRendezVous.getCoach().getId() != null) {
                        Coach coach = coachRepository.findById(newRendezVous.getCoach().getId())
                                .orElseThrow(() -> new RuntimeException("Coach not found with id: " + newRendezVous.getCoach().getId()));
                        existingRdv.setCoach(coach);
                    }

                    // Charger et mettre à jour l'entrepreneur si fourni
                    if (newRendezVous.getEntrepreneur() != null && newRendezVous.getEntrepreneur().getId() != null) {
                        Entrepreneur entrepreneur = entrepreneurRepository.findById(newRendezVous.getEntrepreneur().getId())
                                .orElseThrow(() -> new RuntimeException("Entrepreneur not found with id: " + newRendezVous.getEntrepreneur().getId()));
                        existingRdv.setEntrepreneur(entrepreneur);
                    }

                    return rendezVousRepository.save(existingRdv);
                })
                .orElseThrow(() -> new RuntimeException("Rendez-vous not found with id: " + id));
    }



    public List<RendezVous> getRendezVousByDateAndStatus(LocalDate date, RendezVous.Status status) {
        return rendezVousRepository.findByDateAndStatus(date, status);
    }

    // Mettre à jour uniquement le statut d’un rendez-vous
    public RendezVous updateRendezVousStatus(Long id, RendezVous.Status status) {
        return rendezVousRepository.findById(id)
                .map(existingRdv -> {
                    existingRdv.setStatus(status);
                    return rendezVousRepository.save(existingRdv);
                })
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé avec l'id: " + id));
    }

    public void deleteRendezVous(Long id) {
        if (!rendezVousRepository.existsById(id)) {
            throw new RuntimeException("Rendez-vous non trouvé avec l'id: " + id);
        }
        rendezVousRepository.deleteById(id);
    }
}