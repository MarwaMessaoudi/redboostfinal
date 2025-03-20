import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class GoogleDriveService {
  private apiUrl = 'http://localhost:8085/api/drive';

  constructor(private http: HttpClient) {}

  // Trigger Google OAuth2 authorization
  authorize(): void {
    window.location.href = `${this.apiUrl}/authorize?userId=${this.getCurrentUserId()}`;
  }

  // Create a folder in Google Drive
  createFolder(folderName: string): Observable<string> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User ID not found in token');
    }
    return this.http.post<string>(`${this.apiUrl}/create-folder`, null, {
      params: { folderName, userId: userId.toString() },
    });
  }

  // Upload a file to Google Drive
  uploadFile(folderId: string, fileName: string, file: File): Observable<string> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error('User ID not found in token');
    }
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(`${this.apiUrl}/upload-file`, formData, {
      params: { folderId, fileName, userId: userId.toString() },
    });
  }

  // Get the current logged-in user's ID from the JWT token
  private getCurrentUserId(): number | null {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return null;
    }

    try {
      const decodedToken: any = jwtDecode(accessToken);
      return decodedToken.userId; // Extract userId from the token payload
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }
}