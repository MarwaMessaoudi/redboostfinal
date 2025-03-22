// task.model.ts
import { Phase } from './phase';

export interface TaskCategory {
    id?: number; // Optional for creation
    name: string;
}

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

export interface SubTask {
    subTaskId?: number; // Optional, assigned by backend
    title: string;
    description?: string;
}

export interface Task {
    taskId?: number;
    title: string;
    xpPoint: number;
    description?: string;
    comments?: string;
    assigneeId?: number;
    startDate?: string; // ISO string (e.g., "2025-03-15")
    endDate?: string; // ISO string (e.g., "2025-03-20")
    priority: Priority;
    status: Status;
    phase: Phase; // Changed to ALWAYS be a Phase
    taskCategory: TaskCategory; // Added to match backend TaskCategory relationship
    createdAt?: string; // ISO string (e.g., "2025-03-15T10:00:00")
    updatedAt?: string; // ISO string (e.g., "2025-03-15T12:00:00")
    attachments?: Attachment[]; // Updated to use Attachment interface
    taskCategoryId?: number; // Optional, added for transient field compatibility
    subTasks?: SubTask[]; // Added to support sub-tasks
}
