import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ProfileService } from '../../../services/profile';

@Component({
  selector: 'app-experience-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800 capitalize">Edit Experience</h2>
      <div class="flex gap-2">
        <a [href]="liveUrl" target="_blank"
            class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">View Live</a>
        <button (click)="save()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
      </div>
    </div>

    <div class="space-y-6">
      @for(exp of profile().experience; track $index; let i = $index) {
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
        <button (click)="removeExperience(i)"
            class="absolute top-4 right-4 text-red-500 hover:text-red-700 text-sm">Remove</button>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input type="text" [(ngModel)]="exp.company"
                class="w-full px-3 py-2 border rounded-lg outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input type="text" [(ngModel)]="exp.position"
                class="w-full px-3 py-2 border rounded-lg outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" [(ngModel)]="exp.startDate"
                class="w-full px-3 py-2 border rounded-lg outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="date" [(ngModel)]="exp.endDate"
                class="w-full px-3 py-2 border rounded-lg outline-none">
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea [(ngModel)]="exp.description" rows="2"
                class="w-full px-3 py-2 border rounded-lg outline-none"></textarea>
          </div>
        </div>
      </div>
      }
      <button (click)="addExperience()"
          class="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500 font-medium transition">+ Add Position</button>
    </div>
  `
})
export class ExperienceTabComponent implements OnInit {
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
        if (!this.formData.experience) this.formData.experience = [];
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

  addExperience() {
    this.formData.experience.push({ company: '', position: '', startDate: '', endDate: '', description: '' });
  }

  removeExperience(index: number) {
    this.formData.experience.splice(index, 1);
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