import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../services/profile';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-profile.html',
  styleUrl: './public-profile.css',
})
export class PublicProfileComponent implements OnInit {
  profileService = inject(ProfileService);
  route = inject(ActivatedRoute);
  destroyRef = inject(DestroyRef);
  profile = this.profileService.currentProfile;

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.profileService.getProfileBySlug(slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.profile.set(data),
        error: (err) => console.error('Failed to load profile by slug', err)
      });
    } else {
      this.profileService.getPublicProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          this.profile.set(data);
        },
        error: (err) => {
          console.error('Failed to load profile', err);
        }
      });
    }
  }
}
