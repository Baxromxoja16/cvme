import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProfileService } from '../../../services/profile';
import { ToastService } from '../../../services/toast.service';
import { TabHeaderComponent } from '../tab-header.component';
import { TemplateSwitcherComponent } from '../template-switcher.component';

@Component({
  selector: 'app-profile-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TabHeaderComponent, TemplateSwitcherComponent],
  template: `
    <app-tab-header 
      title="Edit Profile" 
      (save)="save()">
    </app-tab-header>

    <div class="space-y-6" [formGroup]="form">
      <!-- Template Selection -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <app-template-switcher 
          [selectedId]="templateIdControl.value" 
          (selectionChange)="templateIdControl.setValue($event)">
        </app-template-switcher>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold mb-4">Basic Information</h3>
        <div class="grid gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username / Subdomain</label>
            <div class="flex items-center gap-2">
              <input type="text" formControlName="slug"
                  class="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
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

          <ng-container formGroupName="profile">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" formControlName="header"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Headline / About</label>
              <textarea formControlName="about" rows="3"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
              <div class="flex items-center gap-4">
                <div class="relative group" [class.opacity-50]="avatarActiveControl.value === false">
                  <img [src]="avatarControl.value || 'https://via.placeholder.com/150'"
                      class="w-16 h-16 rounded-full object-cover bg-gray-100 border text-xs">
                </div>
                <div class="flex flex-col gap-2">
                  <input type="file" (change)="onFileSelected($event)" class="text-sm">
                  <button (click)="toggleAvatar()" class="text-xs px-3 py-1 rounded border"
                      [ngClass]="{'bg-green-100 text-green-700 border-green-300': avatarActiveControl.value !== false, 'bg-gray-100 text-gray-600 border-gray-300': avatarActiveControl.value === false}">
                    {{ avatarActiveControl.value === false ? 'Show Avatar' : 'Hide Avatar' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Resume / CV (PDF, DOC, DOCX)</label>
              <div class="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                <div class="flex-1">
                  @if (cvUrlControl.value) {
                    <div class="flex items-center gap-2 mb-2">
                      <i [class]="getCvIcon(cvUrlControl.value)" class="text-xl"></i>
                      <a [href]="cvUrlControl.value" target="_blank" class="text-blue-600 hover:underline text-sm font-medium truncate">View Current CV</a>
                      <button (click)="removeCv()" class="text-red-500 hover:text-red-700 ml-2" title="Remove CV">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  } @else {
                    <p class="text-gray-500 text-sm mb-2">No CV uploaded yet.</p>
                  }
                  <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" (change)="onCvSelected($event)" class="text-sm w-full text-gray-500">
                </div>
              </div>
            </div> -->
          </ng-container>
        </div>
      </div>
    </div>
  `
})
export class ProfileTabComponent implements OnInit {
  profileService = inject(ProfileService);
  toastService = inject(ToastService);
  destroyRef = inject(DestroyRef);
  fb = inject(FormBuilder);

  form: FormGroup;
  profile = this.profileService.currentProfile;
  slugStatus = signal<'idle' | 'checking' | 'available' | 'taken'>('idle');
  private originalSlug = '';

  constructor() {
    this.form = this.fb.group({
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      templateId: ['minimalist'],
      profile: this.fb.group({
        header: [''],
        about: [''],
        avatar: [''],
        avatarActive: [true],
        cvUrl: ['']
      })
    });
  }

  get templateIdControl() { return this.form.get('templateId')!; }
  get profileGroup() { return this.form.get('profile') as FormGroup; }
  get avatarControl() { return this.profileGroup.get('avatar')!; }
  get avatarActiveControl() { return this.profileGroup.get('avatarActive')!; }
  get cvUrlControl() { return this.profileGroup.get('cvUrl')!; }

  ngOnInit() {
    this.loadProfile();

    this.form.get('slug')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
       this.handleSlugChange(value);
    });
  }

  handleSlugChange(value: string | null) {
      if (!value) {
        this.slugStatus.set('idle');
        return;
      }
      
      const sanitized = value.toLowerCase().trim()
        .replace(/[^a-z0-9-]/g, '-'); 
      
      if (value !== sanitized) {
          this.form.get('slug')?.setValue(sanitized, { emitEvent: false });
      }

      const currentSlug = this.form.get('slug')?.value;
      
      if (!currentSlug || currentSlug === this.originalSlug) {
        this.slugStatus.set('idle');
        return;
      }

      this.slugStatus.set('checking');
      this.profileService.checkSlugAvailability(currentSlug).subscribe({
        next: (res) => {
          this.slugStatus.set(res.available ? 'available' : 'taken');
        },
        error: () => this.slugStatus.set('idle')
      });
  }

  loadProfile() {
    this.profileService.getMe()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data: any) => {
        this.form.patchValue(data);
        if (!data.profile) {
             this.form.get('profile')?.patchValue({
                 header: '', about: '', avatar: '', avatarActive: true, cvUrl: ''
             });
        }
        this.profile.set(data);
        this.originalSlug = data.slug;
      },
      error: (err) => console.error(err)
    });
  }

  save() {
    if (this.form.invalid) {
        this.toastService.error('Please check your input.');
        return;
    }
    const formData = this.form.getRawValue();

    this.profileService.updateProfile(formData)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data: any) => {
        this.profile.set(data);
        this.originalSlug = data.slug;
        this.slugStatus.set('idle');
        this.toastService.success('Profile saved successfully');
      },
      error: (err) => {
          const message = err?.message || 'Error saving profile';
          this.toastService.error(message);
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
          const url = `${environment.fileUrl}${res.url}`;
          this.avatarControl.setValue(url);
          this.avatarControl.markAsDirty();
        }
      });
    }
  }

  toggleAvatar() {
    const current = this.avatarActiveControl.value;
    this.avatarActiveControl.setValue(!current);
    this.avatarActiveControl.markAsDirty();
  }

  onCvSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const allowedTypes = [
          'application/pdf', 
          'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      // Simple extension check as fallback
      const ext = file.name.split('.').pop()?.toLowerCase();
      const allowedExts = ['pdf', 'doc', 'docx'];

      if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext || '')) {
          this.toastService.error('Only PDF, DOC, and DOCX files are allowed');
          return;
      }

      this.profileService.uploadFile(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const url = `${environment.fileUrl}${res.url}`;
          this.cvUrlControl.setValue(url);
          this.cvUrlControl.markAsDirty();
          this.toastService.success('CV uploaded successfully');
        },
        error: () => this.toastService.error('Error uploading CV')
      });
    }
  }

  removeCv() {
      this.cvUrlControl.setValue('');
      this.cvUrlControl.markAsDirty();
  }

  getCvIcon(url: string): string {
      if (!url) return 'fas fa-file';
      if (url.endsWith('.pdf')) return 'fas fa-file-pdf text-red-500';
      if (url.endsWith('.doc') || url.endsWith('.docs') || url.endsWith('.docx')) return 'fas fa-file-word text-blue-500';
      return 'fas fa-file text-gray-500';
  }
}