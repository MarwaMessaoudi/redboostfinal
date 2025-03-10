// task.model.ts
import { Phase } from './phase';

export enum Priority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH'
}

export enum Status {
    TO_DO = 'TO_DO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE'
}

export interface Attachment {
    name: string;
    url: string; // URL to download the attachment
}

export interface Task {
    taskId?: number;
    title: string;
    xpPoint: number;
    description?: string;
    comments?: string;
    assigneeId?: number;
    startDate?: string;
    endDate?: string;
    priority: Priority;
    status: Status;
    phase: Phase | { phaseId: number; phaseName: string };
    createdAt?: string;
    updatedAt?: string;
    attachments?: Attachment[]; // Updated to use Attachment interface
}
