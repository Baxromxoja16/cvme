import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ProfileService } from '../../../services/profile';

@Component({
  selector: 'app-profile-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800 capitalize">Edit Profile</h2>
      <div class="flex gap-2">
        <a [href]="liveUrl" target="_blank"
            class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">View Live</a>
        <button (click)="save()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
      </div>
    </div>

    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold mb-4">Basic Information</h3>
        <div class="grid gap-4">
          @if(profile().profile) {
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" [(ngModel)]="profile().profile.header"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Headline / About</label>
            <textarea [(ngModel)]="profile().profile.about" rows="3"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
            <div class="flex items-center gap-4">
              <div class="relative group" [class.opacity-50]="profile().profile.avatarActive === false">
                <img [src]="profile().profile.avatar || 'https://via.placeholder.com/150'"
                    class="w-16 h-16 rounded-full object-cover bg-gray-100 border text-xs">
              </div>
              <div class="flex flex-col gap-2">
                <input type="file" (change)="onFileSelected($event)" class="text-sm">
                <button (click)="toggleAvatar()" class="text-xs px-3 py-1 rounded border"
                    [ngClass]="{'bg-green-100 text-green-700 border-green-300': profile().profile.avatarActive !== false, 'bg-gray-100 text-gray-600 border-gray-300': profile().profile.avatarActive === false}">
                  {{ profile().profile.avatarActive === false ? 'Show Avatar' : 'Hide Avatar' }}
                </button>
              </div>
            </div>
          </div>
          }
        </div>
      </div>
    </div>
  `
})
export class ProfileTabComponent implements OnInit {
  profileService = inject(ProfileService);
  destroyRef = inject(DestroyRef);

  formData: any = {};
  profile = this.profileService.currentProfile;

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.profileService.getMe()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data: any) => {
        this.formData = JSON.parse(JSON.stringify(data));
        this.profile.set(data);
      },
      error: (err) => console.error(err)
    });
  }

  save() {
    this.profileService.updateProfile(this.formData)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        this.profile.set(data);
        alert('Profile Saved!');
      },
      error: (err) => alert('Error saving')
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.profileService.uploadFile(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (!this.formData.profile) this.formData.profile = {};
          this.formData.profile.avatar = `${environment.fileUrl}${res.url}`;
        }
      });
    }
  }

  toggleAvatar() {
    if (this.formData.profile) {
      if (this.formData.profile.avatarActive === undefined) {
        this.formData.profile.avatarActive = true;
      }
      this.formData.profile.avatarActive = !this.formData.profile.avatarActive;
    }
  }

  get liveUrl() {
    const slug = this.formData.slug;
    if (!slug) return '#';
    if (environment.production) {
      return `https://${slug}.${environment.baseDomain}`;
    }
    return `http://${slug}.localhost:4200`;
  }
}