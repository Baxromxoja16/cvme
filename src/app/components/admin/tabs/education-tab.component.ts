import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { EducationService } from '../../../services/education.service';
import { ProfileService } from '../../../services/profile';
import { ToastService } from '../../../services/toast.service';
import { TabHeaderComponent } from '../tab-header.component';

@Component({
  selector: 'app-education-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TabHeaderComponent],
  template: `
    <app-tab-header 
      title="Edit Education" 
      [showSave]="false">
    </app-tab-header>

    <div class="space-y-6">
      <div [formGroup]="form">
        <div formArrayName="educations" class="space-y-6">
          @for (group of educationControls; track group.value._id) {
          <div [formGroupName]="$index" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
            <div class="absolute top-4 right-4 flex gap-2">
                <button (click)="saveEducation(group)"
                    class="text-blue-500 hover:text-blue-700 text-sm font-medium">Save</button>
                <button (click)="removeEducation(group.value._id, $index)"
                    class="text-red-500 hover:text-red-700 text-sm">Remove</button>
            </div>
            <div class="grid gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                <input type="text" formControlName="institution"
                    class="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 bg-white text-gray-900">
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                  <input type="text" formControlName="degree"
                      class="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 bg-white text-gray-900">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input type="text" formControlName="year"
                      class="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 bg-white text-gray-900">
                </div>
              </div>
            </div>
          </div>
          }
        </div>
      </div>
      
      <button (click)="addEducation()"
          class="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500 font-medium transition">+ Add Education</button>
    </div>
  `
})
export class EducationTabComponent implements OnInit {
  profileService = inject(ProfileService);
  educationService = inject(EducationService);
  toastService = inject(ToastService);
  confirmationService = inject(ConfirmationService);
  destroyRef = inject(DestroyRef);
  fb = inject(FormBuilder);

  form = this.fb.group({
    educations: this.fb.array([])
  });

  profile = this.profileService.currentProfile;

  get educationControls() {
    return (this.form.get('educations') as FormArray).controls as FormGroup[];
  }

  ngOnInit() {
    this.loadEducation();
  }

  loadEducation() {
    this.educationService.findAll()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        const fa = this.form.get('educations') as FormArray;
        fa.clear();
        data.forEach(edu => {
             fa.push(this.createEducationGroup(edu));
        });
      },
      error: (err) => console.error(err)
    });
  }

  createEducationGroup(edu: any): FormGroup {
      return this.fb.group({
          _id: [edu._id],
          institution: [edu.institution, Validators.required],
          degree: [edu.degree, Validators.required],
          year: [edu.year, Validators.required]
      });
  }

  saveEducation(group: FormGroup) {
    if (group.invalid) {
         this.toastService.error('Please fill required fields');
         return;
    }
    const edu = group.getRawValue();

    this.educationService.update(edu._id, edu)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (updatedEducations) => {
        const fa = this.form.get('educations') as FormArray;
        fa.clear();
        updatedEducations.forEach((e: any) => {
             fa.push(this.createEducationGroup(e));
        });

        const p = this.profile();
        if (p) {
          p.education = updatedEducations;
          this.profile.set({...p});
        }
        this.toastService.success('Education updated successfully');
      },
      error: (err) => this.toastService.error('Error updating education')
    });
  }

  addEducation() {
    const newEdu = { institution: 'New Institution', degree: 'New Degree', year: '2024' };
    this.educationService.add(newEdu)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (updatedEducations) => {
        const fa = this.form.get('educations') as FormArray;
         fa.clear();
        updatedEducations.forEach((e: any) => {
             fa.push(this.createEducationGroup(e));
        });

        const p = this.profile();
        if (p) {
          p.education = updatedEducations;
          this.profile.set({...p});
        }
        this.toastService.success('Education added');
      },
      error: (err) => this.toastService.error('Error adding education')
    });
  }

  removeEducation(educationId: string, index: number) {
    this.confirmationService.confirm({
        message: 'Are you sure you want to delete this education?',
        header: 'Confirm Delete',
        icon: 'pi pi-info-circle',
        accept: () => {
            this.educationService.remove(educationId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (updatedEducations) => {
                const fa = this.form.get('educations') as FormArray;
                fa.removeAt(index);
                // Sync reload
                fa.clear();
                updatedEducations.forEach((e: any) => {
                    fa.push(this.createEducationGroup(e));
                });

                const p = this.profile();
                if (p) {
                  p.education = updatedEducations;
                  this.profile.set({...p});
                }
                this.toastService.success('Education removed');
              },
              error: (err) => this.toastService.error('Error removing education')
            });
        }
    });
  }
}