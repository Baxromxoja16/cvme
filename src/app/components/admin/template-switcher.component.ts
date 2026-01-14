import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-template-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-800">Choose Your Design</h3>
      <p class="text-sm text-gray-500 mb-6">Select a template that matches your personal brand.</p>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        @for (item of templates; track item.id) {
          <div (click)="selectTemplate(item.id)" 
               class="group relative cursor-pointer rounded-2xl border-2 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl"
               [class.border-blue-600]="selectedId === item.id"
               [class.border-transparent]="selectedId !== item.id"
               [class.scale-[1.02]]="selectedId === item.id">
            
            <!-- Selection Badge -->
            @if (selectedId === item.id) {
              <div class="absolute top-4 right-4 z-20 bg-blue-600 text-white p-1.5 rounded-full shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            }

            <!-- Preview Image Area -->
            <div class="h-40 relative bg-gray-100 overflow-hidden">
               <div [class]="item.previewClass" class="absolute inset-0 transition-transform duration-500 group-hover:scale-110">
                  <!-- Visual representation of the template -->
                  <div class="p-4 flex flex-col gap-2 h-full">
                    <div class="w-8 h-8 rounded-full bg-white/50 backdrop-blur-sm self-center"></div>
                    <div class="w-2/3 h-2 rounded bg-white/40 self-center"></div>
                    <div class="w-1/2 h-2 rounded bg-white/40 self-center"></div>
                    <div class="mt-auto grid grid-cols-3 gap-2">
                       <div class="h-10 rounded bg-white/20"></div>
                       <div class="h-10 rounded bg-white/20"></div>
                       <div class="h-10 rounded bg-white/20"></div>
                    </div>
                  </div>
               </div>
               <!-- Overlay for non-selected -->
               @if (selectedId !== item.id) {
                 <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
               }
            </div>

            <!-- Labels -->
            <div class="p-4 bg-white">
              <span class="block font-bold text-gray-800">{{ item.name }}</span>
              <span class="block text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">{{ item.description }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .preview-minimalist { background: linear-gradient(135deg, #fff 0%, #f8fafc 100%); }
    .preview-tech-dark { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); }
    .preview-glass { background: linear-gradient(135deg, #faedff 0%, #fbc2eb 100%); }
  `]
})
export class TemplateSwitcherComponent {
  @Input() selectedId: string = 'minimalist';
  @Output() selectionChange = new EventEmitter<string>();

  templates = [
    { 
      id: 'minimalist', 
      name: 'Minimalist', 
      description: 'Clean & Apple-style',
      previewClass: 'preview-minimalist' 
    },
    { 
      id: 'tech-dark', 
      name: 'Tech Dark', 
      description: 'Developer Focus',
      previewClass: 'preview-tech-dark' 
    },
    { 
      id: 'glassmorphism', 
      name: 'Glassmorphism', 
      description: 'Modern & Creative',
      previewClass: 'preview-glass' 
    }
  ];

  selectTemplate(id: string) {
    this.selectedId = id;
    this.selectionChange.emit(id);
  }
}
