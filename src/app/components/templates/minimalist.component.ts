import { CommonModule } from '@angular/common';
import { Component, Input, WritableSignal, signal } from '@angular/core';

@Component({
  selector: 'app-minimalist-template',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-white text-gray-900 font-sans py-10 px-6">
      <div id="cv-layout" class="max-w-2xl mx-auto" [class.is-printing]="isPrinting()">
        <!-- Header -->
        <header class="text-center mb-10" [class.mb-4]="isPrinting()">
          @if (user.profile.avatar && user.profile.avatarActive !== false) {
            <img [src]="user.profile.avatar" class="w-32 h-32 rounded-full mx-auto mb-6 object-cover shadow-sm border border-gray-100">
          }
          <h1 class="text-4xl font-bold tracking-tight mb-2">{{ user.profile.header || 'Your Name' }}</h1>
          <p class="text-xl text-gray-500 font-light">{{ user.profile.about || 'Professional Headline' }}</p>
        </header>

        <!-- Social/Contacts -->
        <div class="flex justify-center gap-4 mb-10 flex-wrap" [class.mb-6]="isPrinting()">
          @for (contact of user.contacts; track contact.value) {
            <a [href]="contact.value" 
              target="_blank" 
              class="flex items-center gap-2 p-3 bg-gray-50 rounded-full border border-gray-100 no-underline text-gray-700"
              style="min-width: 40px; justify-content: center;">
              
              @if(!isPrinting()) {
                <i [class]="'fa-brands fa-' + contact.type + ' text-xl'"></i>
              }
              @if(isPrinting()) {
                <span style="font-size: 10px; font-weight: bold; font-family: sans-serif;">
                  {{ contact.value | uppercase }}
                </span>
              } 
            </a>
          }
          @if(!isPrinting()) {
            <button (click)="generatePDF()"
              class="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors border border-gray-100">
              <i class="fa-solid fa-file-pdf text-xl"></i>
            </button>
          }
        </div>
        <!-- Experience -->
        @if (user.experience?.length) {
          <section class="mb-10" [class.mb-6]="isPrinting()">
            <h2 class="text-sm uppercase tracking-widest text-gray-400 font-semibold mb-8 border-b pb-2" [class.mb-2]="isPrinting()">Experience</h2>
            <div class="space-y-10" [class.space-y-2]="isPrinting()">
              @for (exp of user.experience; track exp.company) {
                <div>
                  <h3 class="text-lg font-semibold">{{ exp.position }}</h3>
                  <p class="text-gray-600">{{ exp.company }}</p>
                  <p class="text-xs text-gray-400 mt-1">
                    {{ exp.startDate | date:'MMM yyyy' }} — {{ exp.endDate ? (exp.endDate | date:'MMM yyyy') : 'Present' }}
                  </p>
                  @if (exp.description) {
                    <p class="mt-3 text-gray-600 leading-relaxed" [class.text-xs]="isPrinting()">{{ exp.description }}</p>
                  }
                </div>
              }
            </div>
          </section>
        }

        <!-- Skills -->
        @if (user.skills?.length) {
          <section class="mb-10" [class.mb-6]="isPrinting()">
            <h2 class="text-sm uppercase tracking-widest text-gray-400 font-semibold mb-8 border-b pb-2" [class.mb-2]="isPrinting()">Skills</h2>
            <div class="flex flex-wrap gap-2 text-sm" [class.flex-wrap]="isPrinting()">
              <span class="px-2 py-1 text-gray-700 rounded-md border border-gray-100">{{ user.skills.join(' | ') }}</span>
            </div>
          </section>
        }

        <!-- Education -->
        @if (user.education?.length) {
          <section class="mb-10" [class.mb-6]="isPrinting()">
            <h2 class="text-sm uppercase tracking-widest text-gray-400 font-semibold mb-8 border-b pb-2" [class.mb-2]="isPrinting()">Education</h2>
            <div class="space-y-8" [class.space-y-4]="isPrinting()">
              @for (edu of user.education; track edu.institution) {
                <div>
                  <h3 class="text-lg font-semibold">{{ edu.degree }}</h3>
                  <p class="text-gray-600">{{ edu.institution }}</p>
                  <p class="text-sm text-gray-400 mt-1">{{ edu.year }}</p>
                </div>
              }
            </div>
          </section>
        }

        <footer class="text-center pt-10 border-t border-gray-50 text-xs text-gray-300">
          <p>Created with <a href="/" class="text-blue-500 transition-colors">cvme.uz</a></p>
        </footer>
      </div>
    </div>
  `,
  styles: `
    @media print {
      /* Sahifa chekkasidagi oq bo'shliqlarni (margin) brauzer sozlamasiga moslaymiz */
      @page {
        size: A4;
        margin: 0; 
      }

      body {
        padding: 15mm; 
        background: white !important;
        -webkit-print-color-adjust: exact; /* Ranglar va backgroundlar o'chib ketmasligi uchun */
        print-color-adjust: exact;
      }

      #cv-layout {
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
      }

      /* Flex va Grid'lar PDF-da buzilmasligi uchun */
      .flex {
        display: flex !important;
      }
      .gap-4 {
        gap: 1rem !important;
      }
    }
  
  `
})
export class MinimalistTemplateComponent {
  @Input({ required: true }) user: any;
  isPrinting: WritableSignal<boolean> = signal(false);
  
  generatePDF() {
    // 1. PDF uchun maxsus dizaynni yoqamiz
    this.isPrinting.set(true);

    // 2. Sahifa sarlavhasini (Title) vaqtincha saqlab qo'yamiz
    const originalTitle = document.title;
    
    // 3. Yangi sarlavha o'rnatamiz (bu PDF fayl nomi bo'ladi)
    document.title = 'cvme.uz';

    // 4. Angular DOM-ni yangilashi uchun ozgina vaqt beramiz
    setTimeout(() => {
      window.print();

      // 5. Print oynasi yopilgach, sarlavhani va flagni eski holiga qaytaramiz
      document.title = originalTitle;
      this.isPrinting.set(false);
    }, 150);
  }
}
