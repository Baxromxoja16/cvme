import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Project {
  id?: string;
  title: string;
  description: string;
  link: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) { }

  findAll() {
    return this.http.get<Project[]>(this.apiUrl);
  }

  add(project: Partial<Project>) {
    return this.http.post<Project[]>(this.apiUrl, project);
  }

  update(projectId: string, project: Partial<Project>) {
    return this.http.patch<Project[]>(`${this.apiUrl}/${projectId}`, project);
  }

  remove(projectId: string) {
    return this.http.delete<Project[]>(`${this.apiUrl}/${projectId}`);
  }
}
