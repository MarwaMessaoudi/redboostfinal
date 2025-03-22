package team.project.redboost.services;

import team.project.redboost.entities.Category; // Importe la classe Category (l'entité JPA).

import java.util.List; // Importe la classe List pour gérer les collections.

public interface CategoryService {

    Category createCategory(Category category); // Déclare une méthode pour créer une nouvelle catégorie. Prend une entité Category en paramètre.
    Category getCategoryById(Long id); // Déclare une méthode pour récupérer une catégorie par son ID. Prend un ID de type Long en paramètre.
    List<Category> getAllCategories(); // Déclare une méthode pour récupérer toutes les catégories. Retourne une liste de Category.
    Category updateCategory(Long id, Category category); // Déclare une méthode pour mettre à jour une catégorie existante. Prend l'ID de la catégorie à mettre à jour et une entité Category avec les nouvelles données en paramètre.
    void deleteCategory(Long id); // Déclare une méthode pour supprimer une catégorie par son ID. Prend l'ID de la catégorie à supprimer en paramètre.
}
