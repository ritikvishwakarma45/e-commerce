import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { AuthService } from "./services/auth.service";
import { inject, Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    authService = inject(AuthService);
    router = inject(Router);

    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean | UrlTree> {

        try {
            // Method 1: If getCurrentUserData() returns a Promise
            const user = await this.authService.getCurrentUserData();
            console.log('user', user);

            if (!user) {
                return this.router.createUrlTree(['/signup']);
            }

            if (user.role === 'admin') {
                return this.router.createUrlTree(['/home']);
            } else {
                return this.router.createUrlTree(['/signup']);
            }

        } catch (error) {
            console.error('Auth guard error:', error);
            return this.router.createUrlTree(['/signup']);
        }
    }
}