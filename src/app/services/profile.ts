import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/users`;

  // Signals for state
  currentProfile = signal<any>(null);
  loading = signal<boolean>(false);

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) { }

  getPublicProfile() {
    this.loading.set(true);
    let headers = new HttpHeaders();

    if (isPlatformBrowser(this.platformId)) {
      const host = window.location.hostname;
      const parts = host.split('.');
      let slug = '';

      // Check for subdomain
      // e.g. slug.localhost (len 2) or slug.cvme.uz (len 3)
      // Adjust logic to extract slug
      console.log(host);
      if (host.includes('localhost')) {
        if (parts.length >= 2) slug = parts[0];
      } else {
        // Production e.g. slug.cvme.uz
        if (parts.length >= 3) slug = parts[0];
      }

      if (slug && slug !== 'www') {
        headers = headers.set('X-Tenant-Slug', slug);
      }
    }

    return this.http.get(`${this.apiUrl}/public`, { headers });
  }

  getProfileBySlug(slug: string) {
    this.loading.set(true);
    return this.http.get(`${this.apiUrl}/profile/${slug}`);
  }

  getMe() {
    return this.http.get(`${this.apiUrl}/me`);
  }

  updateProfile(data: any) {
    return this.http.patch(`${this.apiUrl}/me`, data);
  }

  uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload`, formData);
  }
}
