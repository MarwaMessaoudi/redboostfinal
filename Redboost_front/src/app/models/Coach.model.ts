// models/coach.ts
export interface Coach {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  experience: string;
  isAvailable: boolean;
  avatar?: string;
  availability?: string;
  
}