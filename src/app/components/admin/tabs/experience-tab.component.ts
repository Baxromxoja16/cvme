import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ExperienceService } from '../../../services/experience.service';
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
      </div>
    </div>

    <div class="space-y-6">
      @for(exp of experiences(); track exp._id) {
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
        <div class="absolute top-4 right-4 flex gap-2">
            <button (click)="saveExperience(exp)"
                class="text-blue-500 hover:text-blue-700 text-sm font-medium">Save</button>
            <button (click)="removeExperience(exp._id)"
                class="text-red-500 hover:text-red-700 text-sm">Remove</button>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input type="text" [(ngModel)]="exp.company"
                class="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input type="text" [(ngModel)]="exp.position"
                class="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" [ngModel]="exp.startDate | date:'yyyy-MM-dd'" (ngModelChange)="exp.startDate = $event"
                class="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="date" [ngModel]="exp.endDate | date:'yyyy-MM-dd'" (ngModelChange)="exp.endDate = $event"
                class="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500">
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea [(ngModel)]="exp.description" rows="2"
                class="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500"></textarea>
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
  experienceService = inject(ExperienceService);
  destroyRef = inject(DestroyRef);

  experiences = signal<any[]>([]);
  profile = this.profileService.currentProfile;

  ngOnInit() {
    this.loadExperience();
  }

  loadExperience() {
    this.experienceService.findAll()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        this.experiences.set(data);
      },
      error: (err) => console.error(err)
    });
  }

  saveExperience(exp: any) {
    this.experienceService.update(exp._id, exp)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (updatedExperiences) => {
        this.experiences.set(updatedExperiences);
        const p = this.profile();
        if (p) {
          p.experience = updatedExperiences;
          this.profile.set({...p});
        }
        alert('Experience updated!');
      },
      error: (err) => alert('Error updating experience')
    });
  }

  addExperience() {
    const newExp = { company: 'New Company', position: 'New Position', startDate: new Date(), endDate: null, description: '' };
    this.experienceService.add(newExp)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (updatedExperiences) => {
        this.experiences.set(updatedExperiences);
        const p = this.profile();
        if (p) {
          p.experience = updatedExperiences;
          this.profile.set({...p});
        }
      },
      error: (err) => alert('Error adding experience')
    });
  }

  removeExperience(experienceId: string) {
    if (!confirm('Are you sure?')) return;
    this.experienceService.remove(experienceId)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (updatedExperiences) => {
        this.experiences.set(updatedExperiences);
        const p = this.profile();
        if (p) {
          p.experience = updatedExperiences;
          this.profile.set({...p});
        }
      },
      error: (err) => alert('Error removing experience')
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
}