import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode'; // Correction de l'import

@Injectable({
  providedIn: 'root',
})
export class GoogleDriveService {
  private apiUrl = 'http://localhost:8085/api/drive';

  constructor(private http: HttpClient) {}

  // Trigger Google OAuth2 authorization
  authorize(): void {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User ID not found in token');
    }
    window.location.href = `${this.apiUrl}/authorize?userId=${userId}`;
  }

  // Fetch list of folders
  getFolders(): Observable<any[]> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return throwError(() => new Error('User ID not found in token'));
    }

    // You might need to adjust the backend to have a dedicated endpoint for listing folders
    //  This assumes you'll create a `/api/drive/folders` endpoint on the backend.
    const params = new HttpParams().set('userId', userId.toString());

    return this.http.get<any[]>(`${this.apiUrl}/folders`, { params }).pipe(
      catchError((error) => {
        console.error('Failed to fetch folders:', error);
        return throwError(() => new Error('Failed to fetch folders'));
      })
    );
  }

  // Create a folder in Google Drive
  createFolder(folderName: string): Observable<string> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return throwError(() => new Error('User ID not found in token'));
    }

    const params = new HttpParams()
      .set('folderName', folderName)
      .set('userId', userId.toString());

    return this.http.post<string>(`${this.apiUrl}/create-folder`, null, { params }).pipe(
      catchError((error) => {
        console.error('Failed to create folder:', error);
        return throwError(() => new Error('Failed to create folder'));
      })
    );
  }

  // Upload a file to Google Drive
  uploadFile(folderId: string, fileName: string, file: File): Observable<string> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return throwError(() => new Error('User ID not found in token'));
    }

    const formData = new FormData();
    formData.append('folderId', folderId);
    formData.append('fileName', fileName);
    formData.append('file', file);
    formData.append('userId', userId.toString());

    return this.http.post<string>(`${this.apiUrl}/upload-file`, formData).pipe(
      catchError((error) => {
        console.error('Failed to upload file:', error);
        return throwError(() => new Error('Failed to upload file'));
      })
    );
  }

  // Get the current logged-in user's ID from the JWT token
  private getCurrentUserId(): number | null {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('Access token not found in localStorage');
      return null;
    }

    try {
      const decodedToken: any = jwtDecode(accessToken);
      if (!decodedToken.userId) {
        console.error('User ID not found in token payload');
        return null;
      }
      return decodedToken.userId; // Extract userId from the token payload
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }
}