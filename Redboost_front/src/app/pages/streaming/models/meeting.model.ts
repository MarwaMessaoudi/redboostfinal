import { User } from './user.model';
export interface Meeting {
    id?: number;
    title: string;  // Changé de "meetingTitle" à "title"
    capacity: number;
    startTime: string;
    endTime: string;
    jitsiUrl?: string;
    host: { id: number };  // Ajout du champ host obligatoire
    currentParticipants?: number;  // Optionnel
    accessCode?: string;
    participants?: User[]; // Ajouter la liste des participants
    note?: any | null; // Vous pouvez définir une interface spécifique pour Note si nécessaire
    record?: any | null;  // Optionnel
}