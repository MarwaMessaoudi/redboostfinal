// user.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();
  private userCache = new Map<number, any>(); // Cache for user profiles

  constructor(private http: HttpClient) {}

  // Set user data
  setUser(user: any): void {
    this.userSubject.next(user);
    if (user?.id) {
      this.userCache.set(user.id, user); // Cache current user
    }
  }

  // Get user data
  getUser(): any {
    return this.userSubject.value;
  }

  // Fetch user by ID with caching
  getUserById(userId: number): Observable<any> {
    // Check cache first
    if (this.userCache.has(userId)) {
      return of(this.userCache.get(userId));
    }

    // Fetch from backend if not in cache
    return this.http.get(`http://localhost:8085/api/users/${userId}`).pipe(
      tap((user) => {
        this.userCache.set(userId, user); // Cache the fetched user
      }),
      catchError((error) => {
        console.error(`Error fetching user with ID ${userId}:`, error);
        return of(null); // Return null on error
      })
    );
  }

  // Submit become a coach request
  submitCoachRequest(request: any): Observable<any> {
    return this.http.post(`http://localhost:8085/api/coach/request`, request);
  }



  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8085/users/ByRoles`);
  }






}