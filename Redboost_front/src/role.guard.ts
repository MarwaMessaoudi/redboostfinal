import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './app/pages/auth/auth.service';

@Injectable({
  providedIn: 'root', // Provided in the root injector
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const expectedRole = route.data['expectedRole']; // Get the expected role from the route data
    const userRole = this.authService.getUserRole(); // Get the user's role from AuthService

    if (userRole === expectedRole) {
      return true; // Allow access if the roles match
    } else {
      this.router.navigate(['/notfound']); // Redirect to a fallback route (e.g., notfound)
      return false; // Deny access
    }
  }
}