import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ExperienceService } from '../../../services/experience.service';
import { ProfileService } from '../../../services/profile';
import { ToastService } from '../../../services/toast.service';
import { TabHeaderComponent } from '../tab-header.component';

@Component({
  selector: 'app-experience-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TabHeaderComponent],
  template: `
    <app-tab-header 
      title="Edit Experience" 
      [showSave]="false">
    </app-tab-header>

    <div class="space-y-6">
      <div [formGroup]="form">
        <div formArrayName="experiences" class="space-y-6">
          @for(group of experienceControls; track group.value._id) {
            <div [formGroupName]="$index" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
              <div class="absolute top-4 right-4 flex gap-2">
                  <button (click)="saveExperience(group)"
                      class="text-blue-500 hover:text-blue-700 text-sm font-medium">Save</button>
                  <button (click)="removeExperience(group.value._id, $index)"
                      class="text-red-500 hover:text-red-700 text-sm">Remove</button>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input type="text" formControlName="company"
                      class="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 bg-white text-gray-900">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input type="text" formControlName="position"
                      class="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 bg-white text-gray-900">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" formControlName="startDate"
                      class="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 bg-white text-gray-900">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" formControlName="endDate"
                      class="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 bg-white text-gray-900">
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea formControlName="description" rows="2"
                      class="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 bg-white text-gray-900"></textarea>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
      
      <button (click)="addExperience()"
          class="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500 font-medium transition">+ Add Position</button>
    </div>
  `
})
export class ExperienceTabComponent implements OnInit {
  profileService = inject(ProfileService);
  experienceService = inject(ExperienceService);
  toastService = inject(ToastService);
  confirmationService = inject(ConfirmationService);
  destroyRef = inject(DestroyRef);
  fb = inject(FormBuilder);

  form = this.fb.group({
      experiences: this.fb.array([])
  });

  profile = this.profileService.currentProfile;

  get experienceControls() {
      return (this.form.get('experiences') as FormArray).controls as FormGroup[];
  }

  ngOnInit() {
    this.loadExperience();
  }

  loadExperience() {
    this.experienceService.findAll()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        const experienceArray = this.form.get('experiences') as FormArray;
        experienceArray.clear();
        data.forEach(exp => {
            experienceArray.push(this.createExperienceGroup(exp));
        });
        this.form.markAllAsDirty()
      },
      error: (err) => console.error(err)
    });
  }

  createExperienceGroup(exp: any): FormGroup {
      return this.fb.group({
          _id: [exp._id],
          company: [exp.company, Validators.required],
          position: [exp.position, Validators.required],
          startDate: [exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''],
          endDate: [exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''],
          description: [exp.description]
      });
  }

  saveExperience(group: FormGroup) {
    if (group.invalid) {
        this.toastService.error('Please fill required fields');
        return;
    }
    const exp = group.getRawValue();
    // Convert date strings back to Date objects if needed by backend, or let backend handle strings.
    // Assuming backend handles strings or we convert here.
    
    this.experienceService.update(exp._id, exp)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (updatedExperiences) => {
        // Update local state if needed OR reload
        // Since we are updating one item, the array might be stale if we don't reload or patch.
        // But backend usually returns the FULL list or the updated item.
        // The service method 'update' in this project returns the updated LIST (based on previous code).
        
        // Let's re-populate the form to be safe and sync.
        const experienceArray = this.form.get('experiences') as FormArray;
        experienceArray.clear();
        updatedExperiences.forEach((e: any) => {
             experienceArray.push(this.createExperienceGroup(e));
        });

        // Sync profile signal
        const p = this.profile();
        if (p) {
          p.experience = updatedExperiences;
          this.profile.set({...p});
        }
        this.toastService.success('Experience updated successfully');
      },
      error: (err) => this.toastService.error('Error updating experience')
    });
  }

  addExperience() {
    const newExp = { company: 'New Company', position: 'New Position', startDate: new Date(), endDate: null, description: '' };
    this.experienceService.add(newExp)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (updatedExperiences) => {
        const experienceArray = this.form.get('experiences') as FormArray;
        experienceArray.clear();
        updatedExperiences.forEach((e: any) => {
             experienceArray.push(this.createExperienceGroup(e));
        });

        const p = this.profile();
        if (p) {
          p.experience = updatedExperiences;
          this.profile.set({...p});
        }
        this.toastService.success('New position added');
      },
      error: (err) => this.toastService.error('Error adding experience')
    });
  }

  removeExperience(experienceId: string, index: number) {
    this.confirmationService.confirm({
        message: 'Are you sure you want to delete this experience?',
        header: 'Confirm Delete',
        icon: 'pi pi-info-circle',
        accept: () => {
            this.experienceService.remove(experienceId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (updatedExperiences) => {
                const experienceArray = this.form.get('experiences') as FormArray;
                experienceArray.removeAt(index); // Optimistic removal or we can reload from updatedExperiences
                
                // Better to sync with backend response
                experienceArray.clear();
                updatedExperiences.forEach((e: any) => {
                    experienceArray.push(this.createExperienceGroup(e));
                });

                const p = this.profile();
                if (p) {
                  p.experience = updatedExperiences;
                  this.profile.set({...p});
                }
                this.toastService.success('Experience deleted');
              },
              error: (err) => this.toastService.error('Error removing experience')
            });
        }
    });
  }
}