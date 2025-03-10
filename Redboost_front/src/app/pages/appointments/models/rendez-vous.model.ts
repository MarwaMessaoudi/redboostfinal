export interface RendezVous {
  id?: number; // Optionnel, généré par le backend
  coachId?: number; // ID du coach
  date: string; // Date au format "YYYY-MM-DD"
  heure: string; // Heure au format "HH:MM" ou "HH:MM:SS" (maintenant String dans la base)
  duration?: string; // Optionnel, pour une durée future
  description?: string; // Description, optionnel
  email?: string; // Email, optionnel
  title: string; // Titre, requis
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'; // Synchronisé avec le backend
}