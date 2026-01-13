import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  private apiUrl = `${environment.apiUrl}/contacts`;

  constructor(private http: HttpClient) { }

  findAll() {
    return this.http.get<any[]>(this.apiUrl);
  }

  add(contact: { type: string; value: string; icon: string }) {
    return this.http.post<any[]>(this.apiUrl, contact);
  }

  update(contactId: string, contact: Partial<{ type: string; value: string; icon: string }>) {
    return this.http.patch<any[]>(`${this.apiUrl}/${contactId}`, contact);
  }

  remove(contactId: string) {
    return this.http.delete<any[]>(`${this.apiUrl}/${contactId}`);
  }
}
