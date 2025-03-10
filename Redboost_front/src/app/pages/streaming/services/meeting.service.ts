// meeting.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting } from '../models/meeting.model'; // Assurez-vous que le chemin est correct

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private apiUrl = 'http://localhost:8085/api/meetings'; // Base URL de l’API

  constructor(private http: HttpClient) {}

  getMeetingsByParticipantId(userId: number): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.apiUrl}/participant/${userId}`);
  }

  getTotalMeetingsCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/by-participant/${userId}/count`); // Mettre à jour l’URL
  }
}