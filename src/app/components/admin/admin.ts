import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth';
import { ProfileService } from '../../services/profile';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent implements OnInit {
  profileService = inject(ProfileService);
  authService = inject(AuthService);
  destroyRef = inject(DestroyRef);

  // Local state for form
  formData: any = {};
  activeTab: 'profile' | 'experience' | 'education' | 'skills' | 'contacts' = 'profile';
  skillInput = '';
  contactInput = '';


  // Use signal for data
  profile = this.profileService.currentProfile;

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.profileService.getMe()
    .pipe(
     takeUntilDestroyed(this.destroyRef) 
    )
    .subscribe({
      next: (data: any) => {
        this.formData = JSON.parse(JSON.stringify(data)); // Deep copy for form
        // Ensure arrays exist
        if (!this.formData.experience) this.formData.experience = [];
        if (!this.formData.education) this.formData.education = [];
        if (!this.formData.skills) this.formData.skills = [];
        if (!this.formData.contacts) this.formData.contacts = [];


        this.profile.set(data);
      },
      error: (err) => console.error(err)
    });
  }

  save() {
    this.profileService.updateProfile(this.formData)
    .pipe(
     takeUntilDestroyed(this.destroyRef) 
    )
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
      .pipe(
       takeUntilDestroyed(this.destroyRef) 
      )
      .subscribe({
        next: (res) => {
          if (!this.formData.profile) this.formData.profile = {};
          // Prepend backend URL if needed or serve relative
          this.formData.profile.avatar = `${environment.fileUrl}${res.url}`;
        }
      });
    }
  }


  // Skills Actions
  addSkill() {
    if (this.skillInput.trim()) {
      this.formData.skills.push(this.skillInput.trim());
      this.skillInput = '';
    }
  }
  removeSkill(index: number) {
    this.formData.skills.splice(index, 1);
  }

  // Contacts Actions
  addContact() {
    if (this.contactInput.trim()) {
      const val = this.contactInput.trim();
      let type = 'link';
      let icon = 'link';

      if (val.includes('telegram') || val.includes('t.me')) type = 'telegram';
      else if (val.includes('linkedin')) type = 'linkedin';
      else if (val.includes('github')) type = 'github';
      else if (val.includes('twitter') || val.includes('x.com')) type = 'twitter';
      else if (val.includes('instagram')) type = 'instagram';
      else if (val.includes('@')) type = 'at';
      else if (val.includes('http')) type = 'website';

      this.formData.contacts.push({ type, value: val, icon: type });
      this.contactInput = '';
    }
  }
  removeContact(index: number) {
    this.formData.contacts.splice(index, 1);
  }

  toggleAvatar() {
    if (this.formData.profile) {
      // Initialize if undefined (for old users)
      if (this.formData.profile.avatarActive === undefined) {
        this.formData.profile.avatarActive = true;
      }
      this.formData.profile.avatarActive = !this.formData.profile.avatarActive;
    }
  }

  get liveUrl() {
    const slug = this.formData.slug;
    if (!slug) return '#';
    // In production use base domain, in dev use localhost with subdomain
    if (environment.production) {
      return `https://${slug}.${environment.baseDomain}`;
    }
    return `http://${slug}.localhost:4200`;
  }

  logout() {
    this.authService.logout();
  }

  setActiveTab(tab: 'profile' | 'experience' | 'education' | 'skills' | 'contacts' = 'profile') {
    this.activeTab = tab;
  }

  // Experience Actions
  addExperience() {
    this.formData.experience.push({ company: '', position: '', startDate: '', endDate: '', description: '' });
  }
  removeExperience(index: number) {
    this.formData.experience.splice(index, 1);
  }

  // Education Actions
  addEducation() {
    this.formData.education.push({ institution: '', degree: '', year: '' });
  }
  removeEducation(index: number) {
    this.formData.education.splice(index, 1);
  }
}
