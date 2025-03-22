import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root'
})
export class CoachService {

  private apiUrl = `${environment.apiUrl}/coaches`;

  constructor(private http: HttpClient) { }

  // Correct method name: getCoaches
  getCoaches(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getCoachById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createCoach(coach: any): Observable<any> {
    return this.http.post(this.apiUrl, coach);
  }

  updateCoach(id: number, coach: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, coach);
  }

  deleteCoach(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}