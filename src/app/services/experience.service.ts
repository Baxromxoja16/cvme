import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExperienceService {
  private apiUrl = `${environment.apiUrl}/experience`;

  constructor(private http: HttpClient) { }

  findAll() {
    return this.http.get<any[]>(this.apiUrl);
  }

  add(experience: any) {
    return this.http.post<any[]>(this.apiUrl, experience);
  }

  update(experienceId: string, experience: any) {
    return this.http.patch<any[]>(`${this.apiUrl}/${experienceId}`, experience);
  }

  remove(experienceId: string) {
    return this.http.delete<any[]>(`${this.apiUrl}/${experienceId}`);
  }
}
