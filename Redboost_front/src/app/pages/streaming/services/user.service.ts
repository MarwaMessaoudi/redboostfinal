// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8085/api/users/getall'; // Changed to base users endpoint

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    console.log('Calling getAllUsers API...');
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json');

    return this.http.get<User[]>(this.apiUrl, { headers });
  }
}