import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, Attachment } from '../models/task';
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
        return this.http.post<Task>(this.apiUrl, task).pipe(map((task) => this.transformTask(task)));
    }

    updateTask(id: number, task: Task): Observable<Task> {
        // Transform the task object to match backend expectations
        const taskToSend = {
            ...task,
            attachments: task.attachments?.map((attachment) => attachment.name) || [] // Send only filenames
        };
        return this.http.put<Task>(`${this.apiUrl}/${id}`, taskToSend).pipe(map((updatedTask) => this.transformTask(updatedTask)));
    }

    deleteTask(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getTasksByPhaseId(phaseId: number): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.apiUrl}/phase/${phaseId}`).pipe(map((tasks) => this.transformTasks(tasks)));
    }

    getAssigneesForTask(taskId: number): Observable<Assignee[]> {
        return this.http.get<Assignee[]>(`${this.apiUrl}/${taskId}/assignees`);
    }

    getCommentsForTask(taskId: number): Observable<Comment[]> {
        return this.http.get<Comment[]>(`${this.apiUrl}/${taskId}/comments`);
    }

    // Corrected downloadAttachment method
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
        return {
            ...task,
            attachments:
                task.attachments?.map((attachment: string | Attachment) => {
                    // If attachment is already an object with a name, use it; otherwise, treat it as a string
                    const name = typeof attachment === 'string' ? attachment : attachment.name;
                    return {
                        name,
                        url: `${this.apiUrl}/${task.taskId}/attachments/${name}`
                    };
                }) || []
        };
    }

    private transformTasks(tasks: Task[]): Task[] {
        return tasks.map((task) => this.transformTask(task));
    }
}
