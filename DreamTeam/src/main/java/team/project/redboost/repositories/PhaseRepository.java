package team.project.redboost.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import team.project.redboost.entities.Phase;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface PhaseRepository extends JpaRepository<Phase, Long> {

    List<Phase> findByStartDateBetween(LocalDate start, LocalDate end);

    @Query(value = """
    SELECT pe.projet_id, 
           GROUP_CONCAT(
               CONCAT(
                   u.id, '|', 
                   u.first_name, '|', 
                   u.last_name, '|', 
                   u.email, '|', 
                   u.phone_number, '|', 
                   u.role, '|', 
                   COALESCE(u.profile_picture_url, '')
               ) SEPARATOR '; '
           ) AS entrepreneurs_info
    FROM projet_entrepreneur pe
    JOIN user u ON pe.user_id = u.id
    WHERE pe.projet_id = :projetId
    GROUP BY pe.projet_id
""", nativeQuery = true)
    List<Map<String, Object>> findEntrepreneursByProject(@Param("projetId") Long projetId);
}