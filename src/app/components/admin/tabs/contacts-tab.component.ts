import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ProfileService } from '../../../services/profile';

@Component({
  selector: 'app-contacts-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800 capitalize">Edit Contacts</h2>
      <div class="flex gap-2">
        <a [href]="liveUrl" target="_blank"
            class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">View Live</a>
        <button (click)="save()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
      </div>
    </div>

    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold mb-4">Add Contacts</h3>
        <div class="flex gap-2 mb-6">
          <input type="text" [(ngModel)]="contactInput" (keyup.enter)="addContact()"
              class="flex-1 px-4 py-2 border rounded-lg outline-none focus:border-blue-500"
              placeholder="e.g. https://t.me/username or user@example.com">
          <button (click)="addContact()"
              class="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">Add</button>
        </div>

        @for(contact of profile().contacts; track $index; let i = $index) {
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
          <div class="flex items-center gap-3">
            <span class="text-md uppercase font-bold text-gray-500 w-16">
              <i [class]="'fa-brands fa-' + contact.type"></i>
            </span>
            <span class="text-gray-900">{{ contact.value }}</span>
          </div>
          <button (click)="removeContact(i)"
              class="text-red-500 hover:text-red-700 text-sm">Remove</button>
        </div>
        }
      </div>
    </div>
  `
})
export class ContactsTabComponent implements OnInit {
  profileService = inject(ProfileService);
  destroyRef = inject(DestroyRef);

  formData: any = {};
  contactInput = '';
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
        if (!this.formData.contacts) this.formData.contacts = [];
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

  get liveUrl() {
    const slug = this.formData.slug;
    if (!slug) return '#';
    if (environment.production) {
      return `https://${slug}.${environment.baseDomain}`;
    }
    return `http://${slug}.localhost:4200`;
  }
}