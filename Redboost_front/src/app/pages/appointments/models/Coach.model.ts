interface Coach {
    id: number;
    firstName: string;
    lastName: string;
    speciality: string; // Correspond à "speciality" dans le backend
    email: string;
    phoneNumber: string;
    experience: string;
    isAvailable: boolean;
    avatar?: string; // Optionnel, car pas dans le backend
    availability?: string; // Optionnel, à calculer si besoin
  }