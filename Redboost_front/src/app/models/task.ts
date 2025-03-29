// task.model.ts
import { Phase } from './phase';

export interface TaskCategory {
    id?: number;
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
    url: string;
}

export interface SubTask {
    subTaskId?: number;
    title: string;
    description?: string;
}

export interface Comment {
    commentId?: number;
    content: string;
    profilePictureUrl?: string;
    firstName: string;
    lastName: string;
    userId: number;
    createdAt?: string; // ISO string
}

export interface Task {
    taskId?: number;
    title: string;
    xpPoint: number;
    description?: string;
    assigneeId?: number;
    startDate?: string;
    endDate?: string;
    priority: Priority;
    status: Status;
    phase: Phase;
    taskCategory: TaskCategory;
    createdAt?: string;
    updatedAt?: string;
    attachments?: Attachment[];
    taskCategoryId?: number;
    subTasks?: SubTask[];
    comments?: Comment[]; // Renamed to avoid conflict with existing 'comments' field
}
