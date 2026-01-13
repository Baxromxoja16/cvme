import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProfileService } from '../../../services/profile';
import { TabHeaderComponent } from '../tab-header.component';

@Component({
  selector: 'app-profile-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TabHeaderComponent],
  template: `
    <app-tab-header 
      title="Edit Profile" 
      (save)="save()">
    </app-tab-header>

    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold mb-4">Basic Information</h3>
        <div class="grid gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username / Subdomain</label>
            <div class="flex items-center gap-2">
              <input type="text" [(ngModel)]="formData.slug" (ngModelChange)="onSlugChange($event)"
                  class="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="yourname">
              <span class="text-gray-500 text-sm">.cvme.uz</span>
            </div>
            
            <div class="mt-1 flex items-center justify-between">
                <p class="text-xs text-gray-400">Only letters, numbers, and hyphens allowed.</p>
                
                @if (slugStatus() === 'checking') {
                    <span class="text-xs text-gray-500 flex items-center gap-1">
                        <i class="fas fa-spinner fa-spin"></i> Checking...
                    </span>
                } @else if (slugStatus() === 'available') {
                    <span class="text-xs text-green-600 font-medium">Available</span>
                } @else if (slugStatus() === 'taken') {
                    <span class="text-xs text-red-600 font-medium">Username is taken</span>
                }
            </div>
          </div>

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
  slugStatus = signal<'idle' | 'checking' | 'available' | 'taken'>('idle');
  private slugSubject = new Subject<string>();
  private originalSlug = '';

  ngOnInit() {
    this.loadProfile();

    this.slugSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(slug => {
      if (!slug || slug === this.originalSlug) {
        this.slugStatus.set('idle');
        return;
      }

      this.slugStatus.set('checking');
      this.profileService.checkSlugAvailability(slug).subscribe({
        next: (res) => {
          this.slugStatus.set(res.available ? 'available' : 'taken');
        },
        error: () => this.slugStatus.set('idle')
      });
    });
  }

  onSlugChange(value: string) {
    if (!value) {
      this.formData.slug = '';
      this.slugStatus.set('idle');
      return;
    }

    const sanitized = value
      .toLowerCase()
      .trim()
      .replace(/\./g, '-')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
    
    this.formData.slug = sanitized;
    this.slugSubject.next(sanitized);
  }

  loadProfile() {
    this.profileService.getMe()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data: any) => {
        this.formData = JSON.parse(JSON.stringify(data));
        this.profile.set(data);
        this.originalSlug = data.slug;
      },
      error: (err) => console.error(err)
    });
  }

  save() {
    this.profileService.updateProfile(this.formData)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data: any) => {
        this.profile.set(data);
        this.originalSlug = data.slug;
        this.slugStatus.set('idle');
        alert('Profile saved!');
      },
      error: (err) => {
          const message = err?.message || 'Error saving';
          alert(message);
      }
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
}