import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicApiService } from '../../services/public-api.service';

@Component({
  selector: 'app-ministries',
  imports: [CommonModule, RouterLink],
  templateUrl: './ministries.component.html',
  styleUrls: ['./ministries.component.css']
})
export class MinistriesComponent implements OnInit {
  sectionTitle = 'NUESTROS MINISTERIOS';
  sectionSubtitle = 'Descubre como puedes servir y crecer en nuestra comunidad.';
  ministries: Array<{ id?: string; name: string; description: string; iconUrl?: string; image?: string }> = [];

  constructor(private publicApi: PublicApiService) {}

  ngOnInit() {
    this.publicApi.getHomeConfig().subscribe({
      next: (data) => {
        const summary = data.ministriesSummary;
        if (summary) {
          this.sectionTitle = summary.sectionTitle || this.sectionTitle;
          this.sectionSubtitle = summary.sectionSubtitle || this.sectionSubtitle;
          const base = 'http://127.0.0.1:3000';
          this.ministries = (summary.ministries || []).map((m: any) => ({
            id: String(m.id ?? ''),
            name: m.name || '',
            description: m.description || '',
            iconUrl: m.iconUrl ? base + m.iconUrl : null,
            image: m.image || (m.cardImageUrl ? base + m.cardImageUrl : '')
          }));
        }
      },
      error: () => {
        this.ministries = [];
      }
    });
  }

  trackByIndex(index: number) {
    return index;
  }
}
