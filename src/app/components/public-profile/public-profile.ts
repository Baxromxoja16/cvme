import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile';
import { ActivatedRoute } from '@angular/router';

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
  profile = this.profileService.currentProfile;

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.profileService.getProfileBySlug(slug).subscribe({
        next: (data) => this.profile.set(data),
        error: (err) => console.error('Failed to load profile by slug', err)
      });
    } else {
      this.profileService.getPublicProfile().subscribe({
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
