// user.model.ts
export interface User {
    id: number; // Ou Long, mais Angular utilise souvent number
    username: string;
    password?: string; // Optionnel, car vous ne voulez peut-être pas le renvoyer depuis l’API
    email: string;
    role?: string;
     // Optionnel, si le rôle n’est pas toujours retourné
  }