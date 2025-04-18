export enum ActivityStatus {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED'
}
export interface Activity {
    
    id?: number; // optionnel à la création
    name: string;
    description?: string;
    startDate: string; // Format ISO: 'YYYY-MM-DD' ou 'YYYY-MM-DDTHH:mm:ss'
    endDate: string;
    ActivityStatus:string;
    program: {
      id: number;
    };
  }
  