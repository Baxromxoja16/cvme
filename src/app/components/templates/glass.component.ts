import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-glass-template',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#faedff] relative overflow-hidden font-sans border-box">
      <!-- Animated Background Blobs -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob"></div>
      <div class="absolute top-[20%] right-[-5%] w-[35%] h-[35%] bg-yellow-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-2000"></div>
      <div class="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-pink-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-4000"></div>

      <div class="relative z-10 max-w-4xl mx-auto py-16 px-4">
        <!-- Main Glass Card -->
        <div class="bg-white/40 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl p-8 md:p-12 overflow-hidden">
          
          <div class="flex flex-col items-center text-center mb-16">
            @if (user.profile.avatar && user.profile.avatarActive !== false) {
              <div class="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-purple-500 to-pink-500 mb-6 transition-transform hover:scale-105 duration-500">
                <img [src]="user.profile.avatar" class="w-full h-full rounded-full object-cover border-4 border-white/50">
              </div>
            }
            <h1 class="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              {{ user.profile.header || 'Your Name' }}
            </h1>
            <p class="text-xl text-gray-600 font-medium max-w-lg">
              {{ user.profile.about || 'Creative Designer & Visual Storyteller' }}
            </p>

            <!-- Links -->
            <div class="flex justify-center gap-3 mt-8 flex-wrap">
              @for (contact of user.contacts; track contact.value) {
                <a [href]="contact.value" target="_blank" 
                   class="flex items-center gap-2 px-6 py-3 bg-white/60 hover:bg-white/80 border border-white/40 rounded-2xl transition-all shadow-sm hover:shadow-md text-gray-700 hover:-translate-y-1">
                  <i [class]="'fa-brands fa-' + contact.type + ' text-purple-600'"></i>
                  <span class="text-sm font-bold uppercase tracking-wide">{{ contact.type }}</span>
                </a>
              }
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-8">
            <!-- Left Column -->
            <div class="space-y-8">
              @if (user.experience?.length) {
                <div class="bg-white/30 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                  <h2 class="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
                    <span class="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-600">🚀</span>
                    Experience
                  </h2>
                  <div class="space-y-6">
                    @for (exp of user.experience; track exp.company) {
                      <div class="relative pl-4 border-l-2 border-purple-500/10">
                        <h3 class="font-bold text-gray-800">{{ exp.position }}</h3>
                        <p class="text-purple-600 text-sm font-bold">{{ exp.company }}</p>
                        <p class="text-[10px] text-gray-500 font-black uppercase mt-1">
                          {{ exp.startDate | date:'MMM yyyy' }} — {{ exp.endDate ? (exp.endDate | date:'MMM yyyy') : 'Current' }}
                        </p>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Right Column -->
            <div class="space-y-8">
               @if (user.skills?.length) {
                <div class="bg-white/30 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                  <h2 class="text-lg font-black text-gray-800 mb-6">Expertise</h2>
                  <div class="flex flex-wrap gap-2">
                    @for (skill of user.skills; track skill) {
                      <span class="px-4 py-2 bg-gradient-to-br from-white/80 to-white/40 border border-white/60 text-gray-700 rounded-xl text-xs font-bold shadow-sm">
                        {{ skill }}
                      </span>
                    }
                  </div>
                </div>
              }

              @if (user.education?.length) {
                <div class="bg-white/30 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                  <h2 class="text-lg font-black text-gray-800 mb-6 italic">Education</h2>
                  @for (edu of user.education; track edu.institution) {
                    <div class="mb-4 last:mb-0">
                      <h3 class="font-bold text-gray-800">{{ edu.degree }}</h3>
                      <p class="text-sm text-gray-500">{{ edu.institution }} — {{ edu.year }}</p>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
          
          <footer class="text-center mt-20 pt-10 border-t border-gray-900/5 text-gray-400 font-medium text-xs">
            MADE ON <a href="/" class="text-purple-600 font-bold hover:underline">CVME.UZ</a>
          </footer>
        </div>
      </div>
    </div>

    <style>
      .animate-blob {
        animation: blob 7s infinite;
      }
      .animation-delay-2000 {
        animation-delay: 2s;
      }
      .animation-delay-4000 {
        animation-delay: 4s;
      }
      @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
      }
    </style>
  `
})
export class GlassTemplateComponent {
  @Input({ required: true }) user: any;
}
