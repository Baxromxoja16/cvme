import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ProfileService } from '../../../services/profile';

@Component({
  selector: 'app-skills-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800 capitalize">Edit Skills</h2>
      <div class="flex gap-2">
        <a [href]="liveUrl" target="_blank"
            class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">View Live</a>
        <button (click)="save()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
      </div>
    </div>

    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold mb-4">Add Skills</h3>
        <div class="flex gap-2 mb-6">
          <input type="text" [(ngModel)]="skillInput" (keyup.enter)="addSkill()"
              class="flex-1 px-4 py-2 border rounded-lg outline-none focus:border-blue-500"
              placeholder="Type a skill and press Enter...">
          <button (click)="addSkill()"
              class="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">Add</button>
        </div>

        <div class="flex flex-wrap gap-2">
            @for(skill of profile().skills; track $index; let i = $index) {
            <span
                class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                {{ skill }}
                <button (click)="removeSkill(i)" class="hover:text-blue-900">×</button>
            </span>
            }
        </div>
      </div>
    </div>
  `
})
export class SkillsTabComponent implements OnInit {
  profileService = inject(ProfileService);
  destroyRef = inject(DestroyRef);

  formData: any = {};
  skillInput = '';
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
        if (!this.formData.skills) this.formData.skills = [];
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

  addSkill() {
    if (this.skillInput.trim()) {
      this.formData.skills.push(this.skillInput.trim());
      this.skillInput = '';
    }
  }

  removeSkill(index: number) {
    this.formData.skills.splice(index, 1);
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