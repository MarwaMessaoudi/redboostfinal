import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { Category } from '../../models/category.model';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {

    private baseUrl = 'http://localhost:8085/api/categories';

    constructor(private http: HttpClient) { }

    private getAccessToken(): string | null {
        return localStorage.getItem('authToken');
    }

    private getHeaders(): HttpHeaders {
        const accessToken = this.getAccessToken();
        let headers = new HttpHeaders();
        if (accessToken) {
            headers = headers.set('Authorization', `Bearer ${accessToken}`);
        }
        return headers;
    }


    getAllCategories(headers? :HttpHeaders): Observable<Category[]> {
      const localHeaders = this.getHeaders()
        return this.http.get<Category[]>(this.baseUrl, { headers: localHeaders })
            .pipe(
                map((categories: Category[]) => {
                    return categories;
                }),
                catchError(this.handleError)
            );
    }

    createCategory(category: Category,headers? :HttpHeaders): Observable<Category> {
     const localHeaders = this.getHeaders()
         let httpOptions = {};
        if (headers) {
            httpOptions = { headers: localHeaders };
        } else {
            httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
        }

        return this.http.post<Category>(this.baseUrl, category, httpOptions)
            .pipe(
                catchError(this.handleError)
            );
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        console.error('An error occurred:', error); // Log the original error

        let errorMessage = 'An unknown error occurred!';

        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else {
            if (typeof error.error === 'string') {
                errorMessage = `Error Code: ${error.status}\nMessage: ${error.error}`;
            } else if (error.error && typeof error.error === 'object') {
                try {
                    if (error.error.message) {
                        errorMessage = `Error Code: ${error.status}\nMessage: ${error.error.message}`;
                    } else if (error.error.error) {
                        errorMessage = `Error Code: ${error.status}\nMessage: ${error.error.error}`;
                    } else if (error.error.errors && Array.isArray(error.error.errors)) {
                        errorMessage = `Error Code: ${error.status}\nMessage: Validation errors:\n`;
                        error.error.errors.forEach((validationError: any) => {
                            errorMessage += `${validationError.field}: ${validationError.defaultMessage}\n`;
                        });
                    }
                    else {
                        errorMessage = `Error Code: ${error.status}\nMessage: ${JSON.stringify(error.error)}`;
                    }
                } catch (e) {
                    errorMessage = `Error Code: ${error.status}\nMessage: Could not parse error message from server. ${e}`;
                }
            } else {
                errorMessage = `Error Code: ${error.status}\nMessage: Unknown error format from server.`;
            }
        }

        console.error(errorMessage);
        return throwError(() => error); //Re-throw the original error
    }
}
