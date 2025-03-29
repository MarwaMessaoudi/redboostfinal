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
    @Query("SELECT p FROM Projet p JOIN p.entrepreneurs e WHERE e.id = :entrepreneurId")
    List<Projet> findByEntrepreneursId(Long entrepreneurId);
    boolean existsByNameIgnoreCase(String name);
}