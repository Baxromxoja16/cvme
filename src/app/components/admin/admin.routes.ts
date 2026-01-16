import { Routes } from '@angular/router';
import { AdminComponent } from './admin';
import { ContactsTabComponent } from './tabs/contacts-tab.component';
import { EducationTabComponent } from './tabs/education-tab.component';
import { ExperienceTabComponent } from './tabs/experience-tab.component';
import { ProfileTabComponent } from './tabs/profile-tab.component';
import { SkillsTabComponent } from './tabs/skills-tab.component';
import { ProjectsTabComponent } from './tabs/projects-tab.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', component: ProfileTabComponent },
      { path: 'skills', component: SkillsTabComponent },
      { path: 'projects', component: ProjectsTabComponent },
      { path: 'contacts', component: ContactsTabComponent },
      { path: 'experience', component: ExperienceTabComponent },
      { path: 'education', component: EducationTabComponent }
    ]
  }
];