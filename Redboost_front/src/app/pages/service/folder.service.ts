import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Folder } from '../../models/folder.model';

@Injectable({
    providedIn: 'root'
})
export class FolderService {
    private apiUrl = 'http://localhost:8085/api/folders';

    constructor(private http: HttpClient) { }

    private handleError(error: HttpErrorResponse): Observable<never> {
        console.error('An error occurred:', error);

        let errorMessage = 'An unknown error occurred!';

        if (error.error instanceof ErrorEvent) {
            // Client-side errors
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Server-side errors
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }

        console.error(errorMessage);
        return throwError(() => error); // Re-throw the original error
    }

    // Create a new folder
    createFolder(folder: Folder, headers?: HttpHeaders): Observable<Folder> {
        return this.http.post<Folder>(this.apiUrl, folder, { headers: headers })
            .pipe(
                map((response: any) => ({
                    ...response,
                    categoryId: response.categoryId || null // Ensure categoryId is included
                })),
                catchError(this.handleError)
            );
    }

    // Get all folders
    getAllFolders(headers?: HttpHeaders): Observable<Folder[]> {
        return this.http.get<Folder[]>(this.apiUrl, { headers: headers })
            .pipe(
                map((folders: any[]) => folders.map(folder => ({
                    ...folder,
                    categoryId: folder.categoryId || null // Ensure categoryId is included
                }))),
                catchError(this.handleError)
            );
    }

    // Delete a folder by ID
    deleteFolder(folderId: number, headers?: HttpHeaders): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${folderId}`, { headers: headers })
            .pipe(catchError(this.handleError));
    }

    // Update a folder
    updateFolder(folder: Folder, headers?: HttpHeaders): Observable<Folder> {
        return this.http.put<Folder>(`${this.apiUrl}/${folder.id}`, folder, { headers: headers })
            .pipe(
                map((response: any) => ({
                    ...response,
                    categoryId: response.categoryId || null // Ensure categoryId is included
                })),
                catchError(this.handleError)
            );
    }
}
