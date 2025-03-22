// folder.service.mock.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';  // Import delay

interface FolderInfo {
  folderName: string;
  categoryName: string;
}

@Injectable({
  providedIn: 'root'
})
export class FolderService {
  getSubfolders(categoryId: number) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = '/api/folders'; // Replace with your API endpoint

  constructor(private http: HttpClient) { }

  getFolderInfo(folderId: string): Observable<FolderInfo> {
    // Simulate an API call with a delay
    const mockData: FolderInfo = {
      folderName: folderId,
      categoryName: 'Simulated Category'
    };

    return of(mockData).pipe(delay(500)); // Simulate a 500ms API delay
    // In a real application, replace the above with an actual HTTP request:
    // return this.http.get<FolderInfo>(`${this.apiUrl}/${folderId}`);
  }
}