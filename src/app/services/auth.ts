import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private jwtHelper = new JwtHelperService();
  currentUser = signal<any>(null);

  constructor(private router: Router) {
    this.checkToken();
  }

  checkToken() {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decoded = this.jwtHelper.decodeToken(token);
      this.currentUser.set(decoded);
    } else {
      this.currentUser.set(null);
    }
  }



  loginWithGoogle() {
    // Redirect to backend Google Auth
    window.location.href = `${environment.authUrl}/google`;
  }

  handleLoginCallback(token: string, slug: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('slug', slug);
    this.checkToken();
    this.router.navigate(['/admin']);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('slug');
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  get token() {
    return localStorage.getItem('token');
  }
}
