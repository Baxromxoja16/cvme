import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tech-dark-template',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#0f172a] text-slate-200 font-sans py-16 px-4">
      <div class="max-w-3xl mx-auto">
        <!-- Profile Card -->
        <div class="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 md:p-12 backdrop-blur-sm mb-8 shadow-2xl relative overflow-hidden">
          <!-- Background decoration -->
          <div class="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
          
          <div class="flex flex-col md:flex-row items-center gap-8 relative z-10">
            @if (user.profile.avatar && user.profile.avatarActive !== false) {
              <div class="relative">
                <div class="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-50"></div>
                <img [src]="user.profile.avatar" class="relative w-32 h-32 rounded-full object-cover border-2 border-slate-900">
              </div>
            }
            <div class="text-center md:text-left">
              <h1 class="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-3">
                {{ user.profile.header || 'Your Name' }}
              </h1>
              <p class="text-lg text-slate-400 font-medium mb-6">
                {{ user.profile.about || 'Senior Software Engineer' }}
              </p>
              
              <div class="flex flex-wrap justify-center md:justify-start gap-3">
                @for (contact of user.contacts; track contact.value) {
                  <a [href]="contact.value" target="_blank" 
                     class="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700 hover:border-blue-500/50 group">
                    <i [class]="'fa-brands fa-' + contact.type + ' text-blue-400 group-hover:scale-110 transition-transform'"></i>
                  </a>
                }
              </div>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-5 gap-8">
          <!-- Main Content -->
          <div class="md:col-span-3 space-y-8">
            <!-- Experience -->
            @if (user.experience?.length) {
              <div class="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
                <h2 class="text-xs uppercase tracking-widest text-blue-400 font-black mb-6 flex items-center gap-2">
                   Experience
                </h2>
                <div class="space-y-8 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800 pl-6">
                  @for (exp of user.experience; track exp.company) {
                    <div class="relative">
                      <div class="absolute -left-5 top-2 w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                      <h3 class="text-lg font-bold text-white">{{ exp.position }}</h3>
                      <p class="text-blue-400 text-sm font-semibold mb-2">{{ exp.company }}</p>
                      <p class="text-xs text-slate-500 mb-3">
                        {{ exp.startDate | date:'yyyy' }} — {{ exp.endDate ? (exp.endDate | date:'yyyy') : 'PRESENT' }}
                      </p>
                      @if (exp.description) {
                        <p class="text-sm text-slate-400 leading-relaxed">{{ exp.description }}</p>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Sidebar -->
          <div class="md:col-span-2 space-y-8">
            <!-- Skills -->
            @if (user.skills?.length) {
              <div class="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
                <h2 class="text-xs uppercase tracking-widest text-indigo-400 font-black mb-6">Expertise</h2>
                <div class="flex flex-wrap gap-2">
                  @for (skill of user.skills; track skill) {
                    <span class="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 rounded-lg border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
                      {{ skill }}
                    </span>
                  }
                </div>
              </div>
            }

            <!-- Education -->
            @if (user.education?.length) {
              <div class="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
                <h2 class="text-xs uppercase tracking-widest text-slate-400 font-black mb-6">Education</h2>
                @for (edu of user.education; track edu.institution) {
                  <div class="mb-4 last:mb-0">
                    <h3 class="text-sm font-bold text-white uppercase tracking-tight">{{ edu.degree }}</h3>
                    <p class="text-xs text-slate-500 mt-1 uppercase">{{ edu.institution }} — {{ edu.year }}</p>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <footer class="text-center mt-12 py-6 border-t border-slate-800/50 text-xs text-slate-600">
          <p>BUILT WITH <a href="/" class="text-blue-500 hover:text-blue-400 transition-colors font-bold tracking-widest">CVME.UZ</a></p>
        </footer>
      </div>
    </div>
  `
})
export class TechDarkTemplateComponent {
  @Input({ required: true }) user: any;
}
