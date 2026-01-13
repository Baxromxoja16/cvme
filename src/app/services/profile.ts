import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private usersUrl = `${environment.apiUrl}/users`;
  private profileUrl = `${environment.apiUrl}/profile`;

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

    return this.http.get(`${this.usersUrl}/public`, { headers });
  }

  getProfileBySlug(slug: string) {
    this.loading.set(true);
    return this.http.get(`${this.usersUrl}/profile/${slug}`);
  }

  getMe() {
    return this.http.get(this.profileUrl);
  }

  updateProfile(data: any) {
    return this.http.patch(this.profileUrl, data);
  }

  uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.profileUrl}/upload`, formData);
  }

  checkSlugAvailability(slug: string) {
    return this.http.get<{ available: boolean }>(`${this.usersUrl}/check-slug/${slug}`);
  }
}
