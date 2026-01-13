import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
  private apiUrl = `${environment.apiUrl}/skills`;

  constructor(private http: HttpClient) { }

  findAll() {
    return this.http.get<string[]>(this.apiUrl);
  }

  add(skill: string) {
    return this.http.post<string[]>(this.apiUrl, { skill });
  }

  update(oldSkill: string, newSkill: string) {
    return this.http.patch<string[]>(this.apiUrl, { oldSkill, newSkill });
  }

  remove(skill: string) {
    return this.http.delete<string[]>(this.apiUrl, { body: { skill } });
  }
}
