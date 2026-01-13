import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../services/profile';
import { SkillsService } from '../../../services/skills.service';
import { TabHeaderComponent } from '../tab-header.component';

@Component({
  selector: 'app-skills-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TabHeaderComponent],
  template: `
    <app-tab-header 
      title="Edit Skills" 
      [showSave]="false">
    </app-tab-header>

    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold mb-4">Add Skills</h3>
        <div class="flex gap-2 mb-6">
          <input type="text" [(ngModel)]="skillInput" (keyup.enter)="addSkill()"
              class="flex-1 px-4 py-2 border rounded-lg outline-none focus:border-blue-500"
              placeholder="Type a skill and press Enter...">
          <button (click)="addSkill()" [disabled]="!skillInput.trim()"
              class="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">Add</button>
        </div>

        <div class="flex flex-wrap gap-2">
            @for(skill of skills(); track $index) {
            <span
                class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                {{ skill }}
                <button (click)="removeSkill(skill)" class="hover:text-blue-900">×</button>
            </span>
            }
        </div>
      </div>
    </div>
  `
})
export class SkillsTabComponent implements OnInit {
  profileService = inject(ProfileService);
  skillsService = inject(SkillsService);
  destroyRef = inject(DestroyRef);

  skillInput = '';
  skills = signal<string[]>([]);
  profile = this.profileService.currentProfile;

  ngOnInit() {
    this.loadSkills();
  }

  loadSkills() {
    this.skillsService.findAll()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        this.skills.set(data);
      },
      error: (err) => console.error(err)
    });
  }

  addSkill() {
    const skill = this.skillInput.trim();
    if (skill) {
      this.skillsService.add(skill)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedSkills) => {
          this.skills.set(updatedSkills);
          this.skillInput = '';
          // Sync with profile service if needed
          const p = this.profile();
          if (p) {
            p.skills = updatedSkills;
            this.profile.set({...p});
          }
        },
        error: (err) => alert('Error adding skill')
      });
    }
  }

  removeSkill(skill: string) {
    this.skillsService.remove(skill)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (updatedSkills) => {
        this.skills.set(updatedSkills);
        const p = this.profile();
        if (p) {
          p.skills = updatedSkills;
          this.profile.set({...p});
        }
      },
      error: (err) => alert('Error removing skill')
    });
  }
}