package team.project.redboost.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import team.project.redboost.entities.Projet;

import java.util.List;

@Repository
public interface ProjetRepository extends JpaRepository<Projet, Long> {
    @Query("SELECT p.name, p.logoUrl, p.sector, p.location, p.creationDate, p.websiteUrl, p.globalScore, p.id " +
            "FROM Projet p JOIN p.entrepreneurs e WHERE e.id = :userId")
    List<Object[]> findProjetCardByUserId(@Param("userId") Long userId);
    boolean existsByNameIgnoreCase(String name);
    @Query("SELECT p FROM Projet p LEFT JOIN FETCH p.pendingCollaborator LEFT JOIN FETCH p.founder")
    List<Projet> findAllWithPendingCollaborator();
    @Query("SELECT p.name AS name, p.logoUrl AS logoUrl, p.websiteUrl AS websiteUrl, p.creationDate AS creationDate " +
            "FROM Projet p")
    List<Projet> findAllProjectsLimited();
    List<Projet> findByEntrepreneursId(Long entrepreneurId);
}