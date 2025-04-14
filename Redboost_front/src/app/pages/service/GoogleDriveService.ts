import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

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
  getFolders(userId: number): Observable<any[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<any[]>(`${this.apiUrl}/folders`, { params }).pipe(
      catchError((error) => {
        console.error('Failed to fetch folders:', error);
        return throwError(() => new Error('Failed to fetch folders'));
      })
    );
  }

  // Create a folder in Google Drive
  createFolder(folderName: string, userId: number): Observable<string> {
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

  // Create a subfolder in Google Drive
  createSubFolder(parentFolderId: string, subFolderName: string, userId: number): Observable<string> {
    const params = new HttpParams()
      .set('parentFolderId', parentFolderId)
      .set('subFolderName', subFolderName)
      .set('userId', userId.toString());

    return this.http.post<string>(`${this.apiUrl}/create-subfolder`, null, { params }).pipe(
      catchError((error) => {
        console.error('Failed to create subfolder:', error);
        return throwError(() => new Error('Failed to create subfolder'));
      })
    );
  }

  // Upload a file to Google Drive
  uploadFile(folderId: string, file: File, userId: number): Observable<string> {
    const formData = new FormData();
    formData.append('folderId', folderId);
    formData.append('file', file);
    formData.append('userId', userId.toString());

    return this.http.post<string>(`${this.apiUrl}/upload-file`, formData).pipe(
      catchError((error) => {
        console.error('Failed to upload file:', error);
        return throwError(() => new Error('Failed to upload file'));
      })
    );
  }

  // Ajoutez cette mÃ©thode
getSubFolders(parentFolderId: string, userId: number): Observable<any[]> {
  const params = new HttpParams()
    .set('parentFolderId', parentFolderId)
    .set('userId', userId.toString());

  return this.http.get<any[]>(`${this.apiUrl}/subfolders`, { params }).pipe(
    catchError((error) => {
      console.error('Failed to fetch subfolders:', error);
      return throwError(() => new Error('Failed to fetch subfolders'));
    })
  );
}

  // Get the current logged-in user's ID from the JWT token
  getCurrentUserId(): number | null {
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
      return decodedToken.userId;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }
}