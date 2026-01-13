import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth';
import { ProfileService } from '../../services/profile';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent implements OnInit {
  profileService = inject(ProfileService);
  authService = inject(AuthService);
  router = inject(Router);
  destroyRef = inject(DestroyRef)

  profile = this.profileService.currentProfile;

  ngOnInit() {
    this.profileService.getMe()
    .pipe(
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe({
      next: (data: any) => {
        this.profile.set(data);
      },
      error: (err) => console.error(err)
    });
  }

  get liveUrl() {
    const slug = this.profile()?.slug;
    if (!slug) return '#';
    if (environment.production) {
      return `https://${slug}.${environment.baseDomain}`;
    }
    return `http://${slug}.localhost:4200`;
  }

  logout() {
    this.authService.logout();
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}