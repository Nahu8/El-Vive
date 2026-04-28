import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import { PublicApiService } from './public-api.service';

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private cache: { value: boolean; at: number } | null = null;
  private readonly ttlMs = 12000;

  constructor(private publicApi: PublicApiService) {}

  invalidate(): void {
    this.cache = null;
  }

  maintenanceActive$(): Observable<boolean> {
    const now = Date.now();
    if (this.cache && now - this.cache.at < this.ttlMs) {
      return of(this.cache.value);
    }

    return this.publicApi.getLayoutConfig().pipe(
      map((layout) => !!(layout && layout.maintenanceMode)),
      tap((active) => {
        this.cache = { value: active, at: Date.now() };
      }),
      catchError(() => {
        this.cache = { value: false, at: Date.now() };
        return of(false);
      })
    );
  }

  checkNow$(): Observable<boolean> {
    return this.maintenanceActive$().pipe(take(1));
  }
}

