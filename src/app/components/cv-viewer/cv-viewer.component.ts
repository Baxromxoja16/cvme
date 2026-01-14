import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProfileService } from '../../services/profile';

@Component({
  selector: 'app-cv-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-screen w-full flex flex-col items-center justify-center bg-gray-100">
      @if (loading()) {
        <div class="flex flex-col items-center gap-3">
            <i class="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
            <p class="text-gray-500 font-medium">Loading CV...</p>
        </div>
      } @else if (error()) {
        <div class="text-center p-8 bg-white rounded-xl shadow-sm max-w-sm">
            <i class="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
            <h2 class="text-xl font-bold text-gray-900 mb-2">CV Not Found</h2>
            <p class="text-gray-500 mb-6">{{ error() }}</p>
            <a href="/" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Go to Profile</a>
        </div>
      } @else if (safeUrl) {
         @if (isPdf()) {
            <iframe [src]="safeUrl" class="w-full h-full border-none" title="CV Viewer"></iframe>
         } @else {
            <div class="text-center p-8 bg-white rounded-xl shadow-sm max-w-sm">
                <i class="fas fa-file-word text-6xl text-blue-600 mb-6"></i>
                <h2 class="text-xl font-bold text-gray-900 mb-2">Preview Not Available</h2>
                <p class="text-gray-500 mb-6">This document format (.doc/.docx) cannot be viewed directly in the browser.</p>
                <a [href]="safeUrl" download class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    <i class="fas fa-download"></i> Download CV
                </a>
            </div>
         }
      }
    </div>
  `
})
export class CvViewerComponent implements OnInit {
  profileService = inject(ProfileService);
  sanitizer = inject(DomSanitizer);
  
  loading = signal(true);
  error = signal<string | null>(null);
  safeUrl: SafeResourceUrl | null = null;
  isPdf = signal(true);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
        this.loadCv();
    }
  }

  loadCv() {
    // Determine slug from hostname
    let host = window.location.hostname; // e.g., 'aglam.cvme.uz' or 'localhost'
    
    // Logic to extract slug (simplified for now, mimicking PublicProfile logic if any)
    // For localhost testing, we might need a reliable way or just fallback to 'me' if authenticated, 
    // but this is a PUBLIC viewer.
    // Assuming the same logic as PublicProfile: 
    // If localhost, maybe hardcode or read from subdomain if simulates.
    // Let's assume the standard subdomain logic used elsewhere:
    
    let slug = '';
    const parts = host.split('.');
    
    if (host.includes('localhost') || host.includes('0.0.0.0')) {
        // For local dev, we might assume the first part is slug if port usage is tricky 
        // OR we just error out if no subdomain. 
        // Let's try to get a "default" or "demo" or check if `parts[0]` is not 'localhost'
        if (parts[0] !== 'localhost') {
            slug = parts[0];
        } else {
             // Fallback for dev: try 'aglam' or similar if needed, or just let it fail.
             // Better: parse path if we want /aglam/cv.pdf, but requirement was subdomain.
             // We can check local storage or auth if logged in? No, public.
             // Let's assume for dev environment we might use a specific slug
             slug = 'aglam'; // Temporary fallback for easy dev testing
        }
    } else {
        if (parts.length >= 3) {
            slug = parts[0];
        } else {
            // Root domain (cvme.uz)
            this.error.set('Please visit a user subdomain directly.');
            this.loading.set(false);
            return;
        }
    }

    this.profileService.getProfileBySlug(slug).subscribe({
        next: (user: any) => {
            if (user.profile && user.profile.cvUrl) {
                this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(user.profile.cvUrl);
                const url = user.profile.cvUrl.toLowerCase();
                this.isPdf.set(url.endsWith('.pdf'));
                this.loading.set(false);
            } else {
                this.error.set('This user has not uploaded a CV yet.');
                this.loading.set(false);
            }
        },
        error: (err) => {
            this.error.set('User not found.');
            this.loading.set(false);
        }
    });
  }
}
