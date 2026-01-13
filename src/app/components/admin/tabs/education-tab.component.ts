import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { EducationService } from '../../../services/education.service';
import { ProfileService } from '../../../services/profile';
import { TabHeaderComponent } from '../tab-header.component';

@Component({
  selector: 'app-education-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TabHeaderComponent],
  template: `
    <app-tab-header 
      title="Edit Education" 
      [showSave]="false">
    </app-tab-header>

    <div class="space-y-6">
      @for (edu of educations(); track edu._id) {
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
        <div class="absolute top-4 right-4 flex gap-2">
            <button (click)="saveEducation(edu)"
                class="text-blue-500 hover:text-blue-700 text-sm font-medium">Save</button>
            <button (click)="removeEducation(edu._id)"
                class="text-red-500 hover:text-red-700 text-sm">Remove</button>
        </div>
        <div class="grid gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Institution</label>
            <input type="text" [(ngModel)]="edu.institution"
                class="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Degree</label>
              <input type="text" [(ngModel)]="edu.degree"
                  class="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input type="text" [(ngModel)]="edu.year"
                  class="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500">
            </div>
          </div>
        </div>
      </div>
      }
      <button (click)="addEducation()"
          class="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500 font-medium transition">+ Add Education</button>
    </div>
  `
})
export class EducationTabComponent implements OnInit {
  profileService = inject(ProfileService);
  educationService = inject(EducationService);
  destroyRef = inject(DestroyRef);

  educations = signal<any[]>([]);
  profile = this.profileService.currentProfile;

  ngOnInit() {
    this.loadEducation();
  }

  loadEducation() {
    this.educationService.findAll()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        this.educations.set(data);
      },
      error: (err) => console.error(err)
    });
  }

  saveEducation(edu: any) {
    this.educationService.update(edu._id, edu)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (updatedEducations) => {
        this.educations.set(updatedEducations);
        const p = this.profile();
        if (p) {
          p.education = updatedEducations;
          this.profile.set({...p});
        }
        alert('Education updated!');
      },
      error: (err) => alert('Error updating education')
    });
  }

  addEducation() {
    const newEdu = { institution: 'New Institution', degree: 'New Degree', year: '2024' };
    this.educationService.add(newEdu)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (updatedEducations) => {
        this.educations.set(updatedEducations);
        const p = this.profile();
        if (p) {
          p.education = updatedEducations;
          this.profile.set({...p});
        }
      },
      error: (err) => alert('Error adding education')
    });
  }

  removeEducation(educationId: string) {
    if (!confirm('Are you sure?')) return;
    this.educationService.remove(educationId)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (updatedEducations) => {
        this.educations.set(updatedEducations);
        const p = this.profile();
        if (p) {
          p.education = updatedEducations;
          this.profile.set({...p});
        }
      },
      error: (err) => alert('Error removing education')
    });
  }
}