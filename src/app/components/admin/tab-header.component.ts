import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ProfileService } from '../../services/profile';

@Component({
  selector: 'app-tab-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800 capitalize">{{ title }}</h2>
      <div class="flex gap-2">
        <ng-content select="[actions]"></ng-content>
        @if (liveUrl) {
          <a [href]="liveUrl" target="_blank"
             class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
             View Live
          </a>
        }
        @if (showSave) {
          <button (click)="save.emit()" 
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm active:transform active:scale-95">
            Save Changes
          </button>
        }
      </div>
    </div>
  `
})
export class TabHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() showSave = true;
  @Output() save = new EventEmitter<void>();

  profileService = inject(ProfileService);

  get liveUrl(): string | null {
    const slug = this.profileService.currentProfile()?.slug;
    if (!slug) return null;
    if (environment.production) {
      return `https://${slug}.${environment.baseDomain}`;
    }
    return `http://${slug}.localhost:4200`;
  }
}
