import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../services/profile';
import { GlassTemplateComponent } from '../templates/glass.component';
import { MinimalistTemplateComponent } from '../templates/minimalist.component';
import { TechDarkTemplateComponent } from '../templates/tech-dark.component';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [
    CommonModule, 
    MinimalistTemplateComponent, 
    TechDarkTemplateComponent, 
    GlassTemplateComponent
  ],
  templateUrl: './public-profile.html',
  styleUrl: './public-profile.css',
})
export class PublicProfileComponent implements OnInit {
  profileService = inject(ProfileService);
  route = inject(ActivatedRoute);
  destroyRef = inject(DestroyRef);
  titleService = inject(Title);
  metaService = inject(Meta);

  profile = this.profileService.currentProfile;

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.profileService.getProfileBySlug(slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.profile.set(data);
          this.updateSEO(data);
        },
        error: (err) => console.error('Failed to load profile by slug', err)
      });
    } else {
      this.profileService.getPublicProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          this.profile.set(data);
          this.updateSEO(data);
        },
        error: (err) => {
          console.error('Failed to load profile', err);
        }
      });
    }
  }

  updateSEO(data: any) {
    if (!data) return;
    const name = data.name || 'Professional';
    const position = data.profile?.position || 'Expert';
    const bio = data.profile?.bio || `View ${name}'s professional portfolio and digital vCard.`;

    this.titleService.setTitle(`${name} | ${position} - Digital vCard`);
    this.metaService.updateTag({ name: 'description', content: bio });
    
    // Open Graph for social sharing
    this.metaService.updateTag({ property: 'og:title', content: `${name} | ${position}` });
    this.metaService.updateTag({ property: 'og:description', content: bio });
    if (data.profile?.avatar) {
      this.metaService.updateTag({ property: 'og:image', content: data.profile.avatar });
    }
  }
}
