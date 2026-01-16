import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../../services/profile';
import { Project, ProjectsService } from '../../../services/projects.service';
import { ToastService } from '../../../services/toast.service';
import { TabHeaderComponent } from '../tab-header.component';

@Component({
  selector: 'app-projects-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TabHeaderComponent],
  template: `
    <app-tab-header 
      title="Edit Projects" 
      [showSave]="false">
    </app-tab-header>

    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold mb-4">Add Projects</h3>
        <div class="flex gap-2 mb-6" [formGroup]="projectInput">
          <input type="text" formControlName="title" (keyup.enter)="addProject()"
              class="flex-1 px-4 py-2 border rounded-lg outline-none focus:border-blue-500 bg-white text-gray-900"
              placeholder="Type a project title and press Enter...">
          <input type="text" formControlName="description" (keyup.enter)="addProject()"
              class="flex-1 px-4 py-2 border rounded-lg outline-none focus:border-blue-500 bg-white text-gray-900"
              placeholder="Type a project description and press Enter...">
          <input type="text" formControlName="link" (keyup.enter)="addProject()"
              class="flex-1 px-4 py-2 border rounded-lg outline-none focus:border-blue-500 bg-white text-gray-900"
              placeholder="Type a project link and press Enter...">
          <button (click)="addProject()" [disabled]="projectInput.invalid"
              class="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50">Add</button>
        </div>

        <div class="flex flex-wrap gap-2">
            @for(project of projects(); track $index) {
            <span
                class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                {{ project?.title }}
                <button (click)="removeProject(project?.id || '')" class="hover:text-blue-900">×</button>
            </span>
            }
        </div>
      </div>
    </div>
  `
})
export class ProjectsTabComponent implements OnInit {
  profileService = inject(ProfileService);
  projectsService = inject(ProjectsService);
  toastService = inject(ToastService);
  destroyRef = inject(DestroyRef);
  fb = inject(FormBuilder);

  projectInput = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.maxLength(255)]],
    link: ['', [Validators.required, Validators.maxLength(255)]],
  });
  projects = signal<Project[]>([]);
  profile = this.profileService.currentProfile;

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.projectsService.findAll()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (data: Project[]) => {
        this.projects.set(data);
      },
      error: (err) => console.error(err)
    });
  }

  addProject() {
    if (this.projectInput.valid) {
      const project = this.projectInput.value;
      this.projectsService.add(project as Project)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedProjects) => {
          this.projects.set(updatedProjects);
          this.projectInput.reset();
          this.toastService.success('Project added');
        },
        error: (err) => this.toastService.error('Error adding project')
      });
    }
  }

  removeProject(projectId: string) {
    this.projectsService.remove(projectId)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (updatedProjects) => {
        this.projects.set(updatedProjects);
        this.toastService.success('Project removed');
      },
      error: (err) => this.toastService.error('Error removing project')
    });
  }
}