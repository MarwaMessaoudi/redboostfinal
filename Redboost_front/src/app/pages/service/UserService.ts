import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {} // Inject HttpClient

  // Set user data
  setUser(user: any): void {
    this.userSubject.next(user);
  }

  // Get user data
  getUser(): any {
    return this.userSubject.value;
  }
  // Submit become a coach request
  submitCoachRequest(request: any): Observable<any> {
    return this.http.post(`http://localhost:8085/api/coach/request`, request);
  }
  
}