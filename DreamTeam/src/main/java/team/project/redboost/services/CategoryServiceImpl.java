package team.project.redboost.services;

import org.springframework.beans.factory.annotation.Autowired; // Importe l'annotation Autowired pour l'injection de dépendances.
import org.springframework.stereotype.Service; // Importe l'annotation Service pour indiquer que cette classe est un service Spring.
import org.springframework.transaction.annotation.Transactional; // Importe l'annotation Transactional pour la gestion des transactions.
import team.project.redboost.entities.Category; // Importe la classe Category (l'entité JPA).
import team.project.redboost.repositories.CategoryRepository; // Importe l'interface CategoryRepository pour accéder aux données.

import java.util.List; // Importe la classe List pour gérer les collections.
import java.util.NoSuchElementException; // Importe la classe NoSuchElementException pour gérer les exceptions.

@Service // Indique que cette classe est un service Spring.
public class CategoryServiceImpl implements CategoryService { // Implémente l'interface CategoryService.

    private final CategoryRepository categoryRepository; // Déclare une dépendance vers CategoryRepository.

    @Autowired // Injecte automatiquement une instance de CategoryRepository dans ce service.
    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional // Indique que cette méthode est transactionnelle.
    public Category createCategory(Category category) {
        return categoryRepository.save(category); // Sauvegarde la catégorie dans la base de données.
    }

    @Override
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id) // Recherche une catégorie par son ID.
                .orElseThrow(() -> new NoSuchElementException("Category not found with id: " + id)); // Lance une exception si la catégorie n'est pas trouvée.
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll(); // Récupère toutes les catégories de la base de données.
    }

    @Override
    @Transactional // Indique que cette méthode est transactionnelle.
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id) // Recherche une catégorie par son ID.
                .orElseThrow(() -> new NoSuchElementException("Category not found with id: " + id)); // Lance une exception si la catégorie n'est pas trouvée.

        category.setCategoryName(categoryDetails.getCategoryName()); // Met à jour le nom de la catégorie.
        category.setDescription(categoryDetails.getDescription()); // Met à jour la description de la catégorie.

        return categoryRepository.save(category); // Sauvegarde la catégorie mise à jour dans la base de données.
    }

    @Override
    @Transactional // Indique que cette méthode est transactionnelle.
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) { // Vérifie si la catégorie existe.
            throw new NoSuchElementException("Category not found with id: " + id); // Lance une exception si la catégorie n'existe pas.
        }
        categoryRepository.deleteById(id); // Supprime la catégorie de la base de données.
    }
}

