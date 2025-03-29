import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, Attachment, TaskCategory, SubTask, Comment } from '../models/task';
import { map } from 'rxjs/operators';

interface Assignee {
    id: number;
    name: string;
    avatar?: string;
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
            taskCategory: { id: task.taskCategory?.id ?? task.taskCategoryId },
            subTasks: task.subTasks || [],
            comments: task.comments || [] // Include comments
        };
        return this.http.post<Task>(this.apiUrl, taskToSend).pipe(map((task) => this.transformTask(task)));
    }

    updateTask(id: number, task: Task): Observable<Task> {
        console.log('Task being sent to update:', task);
        const taskToSend = {
            ...task,
            attachments: task.attachments?.map((attachment) => attachment.name) || [],
            taskCategory: { id: task.taskCategory?.id ?? task.taskCategoryId },
            subTasks: task.subTasks || [],
            comments: task.comments || [] // Include comments
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

    addCommentToTask(taskId: number, comment: Comment): Observable<Task> {
        return this.http.post<Task>(`${this.apiUrl}/${taskId}/comments`, comment).pipe(map((task) => this.transformTask(task)));
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
        let category: TaskCategory | undefined;
        if (task.taskCategory) {
            category = task.taskCategory;
        } else if (task.taskCategoryId) {
            category = { id: task.taskCategoryId, name: 'Unknown' };
        } else {
            category = { id: 0, name: 'None' };
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
            taskCategory: category,
            subTasks: task.subTasks || [],
            comments: task.comments || [] // Ensure comments is always an array
        };
    }

    private transformTasks(tasks: Task[]): Task[] {
        return tasks.map((task) => this.transformTask(task));
    }
}
