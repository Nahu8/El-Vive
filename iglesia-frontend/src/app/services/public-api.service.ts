import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublicApiService {
  private publicUrl = 'http://127.0.0.1:3000/public';
  private apiBase = 'http://127.0.0.1:3000';

  constructor(private http: HttpClient) {}

  /** Resuelve ruta de API a URL completa (para imágenes) */
  resolveAssetUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return path.startsWith('/') ? this.apiBase + path : this.apiBase + '/' + path;
  }

  getHomeConfig(): Observable<any> {
    return this.http.get<any>(`${this.publicUrl}/config/home`);
  }

  getContactConfig(): Observable<any> {
    return this.http.get<any>(`${this.publicUrl}/config/contact`);
  }

  getLayoutConfig(): Observable<any> {
    return this.http.get<any>(`${this.publicUrl}/config/layout`);
  }

  getMinistriesConfig(): Observable<any> {
    return this.http.get<any>(`${this.publicUrl}/config/ministries`);
  }

  getMinistryDetail(id: string): Observable<any> {
    return this.http.get<any>(`${this.publicUrl}/config/ministries/${id}`);
  }

  getMeetingDaysConfig(): Observable<any> {
    return this.http.get<any>(`${this.publicUrl}/config/meeting-days`);
  }

  getUpcomingEvents(): Observable<any> {
    return this.http.get<any>(`${this.publicUrl}/events/upcoming`);
  }

  getCalendarEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.publicUrl}/events/calendar`);
  }
}
