import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ContactsService } from '../../../services/contacts.service';
import { ProfileService } from '../../../services/profile';
import { ToastService } from '../../../services/toast.service';
import { TabHeaderComponent } from '../tab-header.component';

@Component({
  selector: 'app-contacts-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TabHeaderComponent],
  template: `
    <app-tab-header 
      title="Edit Contacts" 
      [showSave]="false">
    </app-tab-header>

    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold mb-4">Add Contacts</h3>
        <div class="flex gap-2 mb-6">
          <input type="text" [formControl]="contactInput" (keyup.enter)="addContact()"
              class="flex-1 px-4 py-2 border rounded-lg outline-none focus:border-blue-500 bg-white text-gray-900"
              placeholder="e.g. https://t.me/username or user@example.com">
          <button (click)="addContact()" [disabled]="contactInput.invalid || !contactInput.value?.trim()"
              class="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">Add</button>
        </div>

        @for(contact of contacts(); track contact._id) {
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
          <div class="flex items-center gap-3">
            <span class="text-md uppercase font-bold text-gray-500 w-16">
              <i [class]="'fa-brands fa-' + contact.type"></i>
            </span>
            <span class="text-gray-900">{{ contact.value }}</span>
          </div>
          <button (click)="removeContact(contact._id)"
              class="text-red-500 hover:text-red-700 text-sm">Remove</button>
        </div>
        }
      </div>
    </div>
  `
})
export class ContactsTabComponent implements OnInit {
  profileService = inject(ProfileService);
  contactsService = inject(ContactsService);
  toastService = inject(ToastService);
  confirmationService = inject(ConfirmationService);
  destroyRef = inject(DestroyRef);

  contactInput = new FormControl('', Validators.required);
  contacts = signal<any[]>([]);
  profile = this.profileService.currentProfile;

  ngOnInit() {
    this.loadContacts();
  }

  loadContacts() {
    this.contactsService.findAll()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data) => {
        this.contacts.set(data);
      },
      error: (err) => console.error(err)
    });
  }

  addContact() {
    if (this.contactInput.valid && this.contactInput.value?.trim()) {
      const val = this.contactInput.value.trim();
      let type = 'link';
      let icon = 'link';

      if (val.includes('telegram') || val.includes('t.me')) type = 'telegram';
      else if (val.includes('linkedin')) type = 'linkedin';
      else if (val.includes('github')) type = 'github';
      else if (val.includes('twitter') || val.includes('x.com')) type = 'twitter';
      else if (val.includes('instagram')) type = 'instagram';
      else if (val.includes('@')) type = 'at';
      else if (val.includes('http')) type = 'website';

      this.contactsService.add({ type, value: val, icon: type })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedContacts) => {
          this.contacts.set(updatedContacts);
          this.contactInput.reset();
          const p = this.profile();
          if (p) {
            p.contacts = updatedContacts;
            this.profile.set({...p});
          }
          this.toastService.success('Contact added');
        },
        error: (err) => this.toastService.error('Error adding contact')
      });
    }
  }

  removeContact(contactId: string) {
    this.confirmationService.confirm({
        message: 'Are you sure you want to delete this contact?',
        header: 'Confirm Delete',
        icon: 'pi pi-info-circle',
        accept: () => {
            this.contactsService.remove(contactId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (updatedContacts) => {
                this.contacts.set(updatedContacts);
                const p = this.profile();
                if (p) {
                  p.contacts = updatedContacts;
                  this.profile.set({...p});
                }
                this.toastService.success('Contact removed');
              },
              error: (err) => this.toastService.error('Error removing contact')
            });
        }
    });
  }
}