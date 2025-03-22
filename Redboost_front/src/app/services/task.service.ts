import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, Attachment, TaskCategory, SubTask } from '../models/task';
import { map } from 'rxjs/operators';

interface Assignee {
    id: number;
    name: string;
    avatar?: string;
}

interface Comment {
    id: number;
    authorName: string;
    authorAvatar?: string;
    content: string;
    createdAt: Date;
}

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private apiUrl = 'http://localhost:8085/api/tasks';

    constructor(private http: HttpClient) {}

    getAllTasks(): Observable<Task[]> {
        return this.http.get<Task[]>(this.apiUrl).pipe(map((tasks) => this.transformTasks(tasks)));
    }

    getTaskById(id: number): Observable<Task> {
        return this.http.get<Task>(`${this.apiUrl}/${id}`).pipe(map((task) => this.transformTask(task)));
    }

    createTask(task: Task): Observable<Task> {
        const taskToSend = {
            ...task,
            attachments: task.attachments?.map((attachment) => attachment.name) || [],
            taskCategory: { id: task.taskCategory?.id ?? task.taskCategoryId }, // Send only id
            subTasks: task.subTasks || [] // Include sub-tasks
        };
        return this.http.post<Task>(this.apiUrl, taskToSend).pipe(map((task) => this.transformTask(task)));
    }

    updateTask(id: number, task: Task): Observable<Task> {
        console.log('Task being sent to update:', task); // Debug
        const taskToSend = {
            ...task,
            attachments: task.attachments?.map((attachment) => attachment.name) || [],
            taskCategory: { id: task.taskCategory?.id ?? task.taskCategoryId }, // Use taskCategoryId as fallback
            subTasks: task.subTasks || [] // Include sub-tasks
        };
        return this.http.put<Task>(`${this.apiUrl}/${id}`, taskToSend).pipe(map((updatedTask) => this.transformTask(updatedTask)));
    }

    deleteTask(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getTasksByPhaseId(phaseId: number): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.apiUrl}/phase/${phaseId}`).pipe(map((tasks) => this.transformTasks(tasks)));
    }

    getTasksByCategoryId(categoryId: number): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.apiUrl}/category/${categoryId}`).pipe(map((tasks) => this.transformTasks(tasks)));
    }

    getAssigneesForTask(taskId: number): Observable<Assignee[]> {
        return this.http.get<Assignee[]>(`${this.apiUrl}/${taskId}/assignees`);
    }

    getCommentsForTask(taskId: number): Observable<Comment[]> {
        return this.http.get<Comment[]>(`${this.apiUrl}/${taskId}/comments`);
    }

    downloadAttachment(taskId: number, fileName: string): Observable<Blob> {
        const url = `${this.apiUrl}/${taskId}/attachments/${fileName}`;
        const headers = new HttpHeaders({
            Accept: 'application/octet-stream'
        });
        return this.http.get(url, {
            headers: headers,
            responseType: 'blob'
        });
    }

    private transformTask(task: Task): Task {
        // Ensure taskCategory is always an object, even if minimal
        let category: TaskCategory | undefined;
        if (task.taskCategory) {
            category = task.taskCategory; // use existing TaskCategory data
        } else if (task.taskCategoryId) {
            category = { id: task.taskCategoryId, name: 'Unknown' };
        } else {
            category = { id: 0, name: 'None' }; // or whatever default makes sense
        }

        return {
            ...task,
            attachments:
                task.attachments?.map((attachment: string | Attachment) => {
                    const name = typeof attachment === 'string' ? attachment : attachment.name;
                    return {
                        name,
                        url: `${this.apiUrl}/${task.taskId}/attachments/${name}`
                    };
                }) || [],
            taskCategory: category, // Now always defined
            subTasks: task.subTasks || [] // Ensure subTasks is always an array
        };
    }

    private transformTasks(tasks: Task[]): Task[] {
        return tasks.map((task) => this.transformTask(task));
    }
}
