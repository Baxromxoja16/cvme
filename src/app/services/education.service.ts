import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EducationService {
  private apiUrl = `${environment.apiUrl}/education`;

  constructor(private http: HttpClient) { }

  findAll() {
    return this.http.get<any[]>(this.apiUrl);
  }

  add(education: any) {
    return this.http.post<any[]>(this.apiUrl, education);
  }

  update(educationId: string, education: any) {
    return this.http.patch<any[]>(`${this.apiUrl}/${educationId}`, education);
  }

  remove(educationId: string) {
    return this.http.delete<any[]>(`${this.apiUrl}/${educationId}`);
  }
}
