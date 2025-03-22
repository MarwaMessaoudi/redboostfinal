import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoachService {
  private apiUrl = 'http://localhost:8085/api/coachlist'; // URL de ton backend

  constructor(private http: HttpClient) { }

  getCoaches(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}