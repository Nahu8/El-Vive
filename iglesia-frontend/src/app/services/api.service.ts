import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://127.0.0.1:3000/api';

  constructor(private http: HttpClient) { }

  // ==================== HOME ====================
  getHome(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/home`);
  }

  updateHome(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/home`, data);
  }

  updateHero(heroData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/home/hero`, heroData);
  }

  uploadHeroVideo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('video', file);
    return this.http.post<any>(`${this.apiUrl}/home/video`, formData);
  }

  deleteHeroVideo(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/home/video`);
  }

  uploadHeroVideo2(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('video', file);
    return this.http.post<any>(`${this.apiUrl}/home/video2`, formData);
  }

  deleteHeroVideo2(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/home/video2`);
  }

  uploadIconDom(file: File): Observable<any> {
    const fd = new FormData();
    fd.append('icon', file);
    return this.http.post<any>(`${this.apiUrl}/home/icon-dom`, fd);
  }

  deleteIconDom(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/home/icon-dom`);
  }

  uploadIconMier(file: File): Observable<any> {
    const fd = new FormData();
    fd.append('icon', file);
    return this.http.post<any>(`${this.apiUrl}/home/icon-mier`, fd);
  }

  deleteIconMier(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/home/icon-mier`);
  }

  // Ministry media
  uploadMinistryIcon(ministryId: string, file: File): Observable<any> {
    const fd = new FormData(); fd.append('icon', file);
    return this.http.post<any>(`${this.apiUrl}/ministry/${ministryId}/icon`, fd);
  }
  deleteMinistryIcon(ministryId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/ministry/${ministryId}/icon`);
  }
  uploadMinistryPhoto(ministryId: string, file: File): Observable<any> {
    const fd = new FormData(); fd.append('photo', file);
    return this.http.post<any>(`${this.apiUrl}/ministry/${ministryId}/photo`, fd);
  }
  deleteMinistryPhoto(ministryId: string, photoId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/ministry/${ministryId}/photo/${photoId}`);
  }
  uploadMinistryCardImage(ministryId: string, file: File): Observable<any> {
    const fd = new FormData();
    fd.append('image', file);
    return this.http.post<any>(`${this.apiUrl}/ministry/${ministryId}/card-image`, fd);
  }
  deleteMinistryCardImage(ministryId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/ministry/${ministryId}/card-image`);
  }
  uploadMinistryVideo(ministryId: string, file: File): Observable<any> {
    const fd = new FormData();
    fd.append('video', file);
    return this.http.post<any>(`${this.apiUrl}/ministry/${ministryId}/video`, fd);
  }
  deleteMinistryVideo(ministryId: string, videoId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/ministry/${ministryId}/video/${videoId}`);
  }
  getMinistryMedia(ministryId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ministry/${ministryId}/media`);
  }

  uploadCardImage(cardIndex: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<any>(`${this.apiUrl}/home/card-image/${cardIndex}`, formData);
  }

  deleteCardImage(cardIndex: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/home/card-image/${cardIndex}`);
  }

  updateCelebrations(celebrations: any[]): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/home/celebrations`, { celebrations });
  }

  updateMeetingDaysSummary(meetingDaysSummary: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/home/meeting-days-summary`, { meetingDaysSummary });
  }

  updateMinistriesSummary(ministriesSummary: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/home/ministries-summary`, { ministriesSummary });
  }

  // ==================== MEETING DAYS ====================
  getMeetingDays(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/meeting-days`);
  }

  updateMeetingDays(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/meeting-days`, data);
  }

  updateMeetingDaysHero(hero: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/meeting-days/hero`, { hero });
  }

  updateCalendarEvents(calendarEvents: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/meeting-days/calendar-events`, { calendarEvents });
  }

  updateUpcomingEvents(upcomingEvents: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/meeting-days/upcoming-events`, { upcomingEvents });
  }

  updateEventCta(eventCta: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/meeting-days/event-cta`, { eventCta });
  }

  updateRecurringMeetings(recurringMeetings: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/meeting-days/recurring-meetings`, { recurringMeetings });
  }

  updateEventSettings(eventSettings: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/meeting-days/event-settings`, { eventSettings });
  }

  uploadMeetingDaysHeroImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<any>(`${this.apiUrl}/meeting-days/hero-image`, formData);
  }

  deleteMeetingDaysHeroImage(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/meeting-days/hero-image`);
  }

  uploadEventIcon(eventId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('icon', file);
    return this.http.post<any>(`${this.apiUrl}/event/${eventId}/icon`, formData);
  }

  deleteEventIcon(eventId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/event/${eventId}/icon`);
  }

  uploadEventBackground(eventId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<any>(`${this.apiUrl}/event/${eventId}/background`, formData);
  }

  deleteEventBackground(eventId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/event/${eventId}/background`);
  }

  getEventIconUrl(eventId: string): string {
    return `${this.apiUrl}/event/${eventId}/icon`;
  }

  getEventBackgroundUrl(eventId: string): string {
    return `${this.apiUrl}/event/${eventId}/background`;
  }

  /** Resuelve una ruta relativa de API (ej: /api/event/123/icon) a URL completa */
  resolveAssetUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = this.apiUrl.replace(/\/api\/?$/, '');
    return (path.startsWith('/') ? base + path : base + '/' + path);
  }

  // ==================== SECTION ICONS ====================
  uploadSectionIcon(pageKey: string, sectionKey: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('icon', file);
    return this.http.post<any>(`${this.apiUrl}/section-icon/${pageKey}/${sectionKey}`, formData);
  }

  deleteSectionIcon(pageKey: string, sectionKey: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/section-icon/${pageKey}/${sectionKey}`);
  }

  getSectionIconUrl(pageKey: string, sectionKey: string): string {
    return `${this.apiUrl}/section-icon/${pageKey}/${sectionKey}`;
  }

  // ==================== MINISTRIES ====================
  getMinistriesContent(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ministries-content`);
  }

  updateMinistriesContent(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/ministries-content`, data);
  }

  updateMinistriesHero(hero: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/ministries-content/hero`, { hero });
  }

  updateMinistriesList(ministries: any[]): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/ministries-content/ministries`, { ministries });
  }

  updateProcess(process: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/ministries-content/process`, { process });
  }

  updateTestimonials(testimonials: any[]): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/ministries-content/testimonials`, { testimonials });
  }

  updateFAQs(faqs: any[]): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/ministries-content/faqs`, { faqs });
  }

  updatePageContent(pageContent: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/ministries-content/page-content`, { pageContent });
  }

  // ==================== LAYOUT (Nav + Footer) ====================
  getLayout(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/layout`);
  }

  updateLayout(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/layout`, data);
  }

  // ==================== CONTACT INFO ====================
  getContactInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/contact-info`);
  }

  updateContactInfo(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/contact-info`, data);
  }

  updateBasicInfo(basicInfo: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/contact-info/basic`, basicInfo);
  }

  updateContactPageContent(pageContent: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/contact-info/page-content`, { pageContent });
  }

  updateSocialMedia(socialMedia: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/contact-info/social-media`, { socialMedia });
  }

  updateSchedules(schedules: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/contact-info/schedules`, { schedules });
  }

  updateDepartments(departments: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/contact-info/departments`, { departments });
  }

  // ==================== EVENTS (Legacy) ====================
  getEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/events`);
  }

  createEvent(event: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/events`, event);
  }

  updateEvent(id: string, event: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/events/${id}`, event);
  }

  deleteEvent(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/events/${id}`);
  }

  // ==================== MINISTRIES (Legacy) ====================
  getMinistries(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ministries`);
  }

  createMinistry(ministry: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ministries`, ministry);
  }

  updateMinistry(id: string, ministry: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/ministries/${id}`, ministry);
  }

  deleteMinistry(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/ministries/${id}`);
  }

  // ==================== CONTACT MESSAGES ====================
  submitContact(formData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/contact`, formData);
  }

  getContactMessages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/contact`);
  }

  getContactMessage(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/contact/${id}`);
  }

  deleteContactMessage(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/contact/${id}`);
  }

  // ==================== HEALTH CHECK ====================
  healthCheck(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/health`);
  }
}
